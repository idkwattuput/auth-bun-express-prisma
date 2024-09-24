import express from "express";
import type { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./middlewares/log";
import { verifyJWT } from "./middlewares/jwt";
import type { AuthRoute } from "./routes/auth-route";

export class App {
  authRoute: AuthRoute;
  app: Express;

  constructor(authRoute: AuthRoute) {
    this.authRoute = authRoute;
    this.app = express();
    this.setMiddlewares();
    this.setRoutes();
    this.handleInvalidRoutes();
  }

  // Middlewares
  setMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(logger);
  }

  // Routes
  setRoutes() {
    // Routes that don't need JWT verification
    this.app.use("/api/v1/auth", this.authRoute.router);

    // JWT middleware for routes that need verification
    this.app.use(verifyJWT);

    // Example of a route requiring JWT
    // this.app.use("/api/v1/todos", todosRoute);
  }

  // Handle 404 for non-existent routes
  handleInvalidRoutes() {
    this.app.use((_, res) => {
      res.status(404).json({ message: "Route not found" });
    });
  }

  // Start the server
  start(port: string | number) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
