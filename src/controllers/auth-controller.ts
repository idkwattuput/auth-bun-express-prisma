import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { UserRepository } from "../repositories/user-repository";

export class AuthController {
  userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async register(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (
        !firstName ||
        typeof firstName !== "string" ||
        !lastName ||
        typeof lastName !== "string" ||
        !email ||
        typeof email !== "string" ||
        !password ||
        typeof password !== "string"
      ) {
        return res.status(400).json({ message: "All field are required" });
      }

      const isEmailExist = await this.userRepository.findByEmail(email);
      if (isEmailExist) {
        return res.status(400).json({ message: "email already exist" });
      }

      const hashPassword = await bcrypt.hash(password, 12);

      const newUser = await this.userRepository.save(
        firstName,
        lastName,
        email,
        hashPassword,
      );

      const accessToken = jwt.sign(
        { id: newUser.id },
        Bun.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: Bun.env.ACCESS_TOKEN_EXPIRES! },
      );
      const refreshToken = jwt.sign(
        { id: newUser.id },
        Bun.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: Bun.env.REFRESH_TOKEN_EXPIRES! },
      );

      await this.userRepository.updateRefreshToken(newUser.id, refreshToken);

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // maxAge: 1day
      });

      return res.json({ accessToken: accessToken });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (
        !email ||
        typeof email !== "string" ||
        !password ||
        typeof password !== "string"
      ) {
        return res.status(400).json({ message: "All field are required" });
      }

      const isEmailExist = await this.userRepository.findByEmail(email);
      if (!isEmailExist) {
        return res
          .status(400)
          .json({ message: "Email or password is incorrect" });
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        isEmailExist.password,
      );
      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ message: "Email or password is incorrect" });
      }

      const accessToken = jwt.sign(
        { id: isEmailExist.id },
        Bun.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: Bun.env.ACCESS_TOKEN_EXPIRES! },
      );
      const refreshToken = jwt.sign(
        { id: isEmailExist.id },
        Bun.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: Bun.env.REFRESH_TOKEN_EXPIRES! },
      );

      await this.userRepository.updateRefreshToken(
        isEmailExist.id,
        refreshToken,
      );

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // maxAge: 1day
      });

      return res.json({ accessToken: accessToken });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const cookies: { refresh_token?: string } = req.cookies;

      if (!cookies?.refresh_token) {
        return res.sendStatus(401);
      }

      const refreshToken = cookies.refresh_token;

      const isRefreshTokenExist =
        await this.userRepository.findByRefreshToken(refreshToken);
      if (!isRefreshTokenExist) {
        return res.sendStatus(403);
      }

      jwt.verify(refreshToken, Bun.env.REFRESH_TOKEN_SECRET!, (err, decode) => {
        if (err || isRefreshTokenExist.id !== (decode as { id: number }).id) {
          return res.sendStatus(403);
        }

        const accessToken = jwt.sign(
          { id: (decode as { id: number }).id },
          Bun.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: Bun.env.ACCESS_TOKEN_EXPIRES! },
        );

        return res.json({ accessToken: accessToken });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const cookies: { refresh_token?: string } = req.cookies;

      if (!cookies?.refresh_token) {
        return res.sendStatus(204);
      }

      const refreshToken = cookies.refresh_token;

      const isRefreshTokenExist =
        await this.userRepository.findByRefreshToken(refreshToken);
      if (!isRefreshTokenExist) {
        res.clearCookie("refresh_token", {
          httpOnly: true,
          sameSite: "none",
        });
        return res.sendStatus(204);
      }

      await this.userRepository.updateRefreshToken(
        isRefreshTokenExist.id,
        null,
      );

      res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "none",
      });

      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
}
