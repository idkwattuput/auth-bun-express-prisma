import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/user-repository";

async function register(req: Request, res: Response, next: NextFunction) {
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

    const isEmailExist = await userRepository.findByEmail(email);
    if (isEmailExist) {
      return res.status(400).json({ message: "This email already exist" });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = await userRepository.save(
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

    await userRepository.updateRefreshToken(newUser.id, refreshToken);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // maxAge: 1day
    });

    return res.json({ accessToken: accessToken });
  } catch (error) {
    next(error);
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
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

    const isEmailExist = await userRepository.findByEmail(email);
    if (!isEmailExist) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      isEmailExist.password,
    );
    if (!isPasswordMatch) {
      return res
        .status(401)
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

    await userRepository.updateRefreshToken(isEmailExist.id, refreshToken);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // maxAge: 1day
    });

    return res.json({ accessToken: accessToken });
  } catch (error) {
    next(error);
  }
}

async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const cookies: { refresh_token?: string } = req.cookies;

    if (!cookies?.refresh_token) {
      return res.sendStatus(401);
    }

    const refreshToken = cookies.refresh_token;

    const isRefreshTokenExist =
      await userRepository.findByRefreshToken(refreshToken);
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
    next(error);
  }
}

async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const cookies: { refresh_token?: string } = req.cookies;

    if (!cookies?.refresh_token) {
      return res.sendStatus(204);
    }

    const refreshToken = cookies.refresh_token;

    const isRefreshTokenExist =
      await userRepository.findByRefreshToken(refreshToken);
    if (!isRefreshTokenExist) {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "none",
      });
      return res.sendStatus(204);
    }

    await userRepository.updateRefreshToken(isRefreshTokenExist.id, null);

    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "none",
    });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  refresh,
  logout,
};
