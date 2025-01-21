import express from "express";
import authController from "../controllers/auth-controller";

const authRouter = express.Router();

authRouter.route("/register").post(authController.register);
authRouter.route("/login").post(authController.login);
authRouter.route("/refresh").get(authController.refresh);
authRouter.route("/logout").get(authController.logout);

export default authRouter;
