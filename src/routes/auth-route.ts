import express from "express";
import authController from "../controllers/auth-controller";

const router = express.Router();

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/refresh").get(authController.refresh);
router.route("/logout").get(authController.logout);

export default router;
