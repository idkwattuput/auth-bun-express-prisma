import express, { Router } from "express";
import { AuthController } from "../controllers/auth-controller";

export class AuthRoute {
  authController: AuthController;
  router: Router;

  constructor(authController: AuthController) {
    this.authController = authController;
    this.router = express.Router();
    this.setRoute();
  }

  private setRoute() {
    this.router
      .route("/register")
      .post(this.authController.register.bind(this.authController));
    this.router
      .route("/login")
      .post(this.authController.login.bind(this.authController));
    this.router
      .route("/refresh")
      .get(this.authController.refresh.bind(this.authController));
    this.router
      .route("/logout")
      .get(this.authController.logout.bind(this.authController));
  }
}
