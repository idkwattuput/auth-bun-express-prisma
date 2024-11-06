import express from "express";
import type { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./middlewares/log";
import { verifyJWT } from "./middlewares/jwt";
import type { AuthRoute } from "./routes/auth-route";
import { credentials } from "./middlewares/credentials";
import { corsOptions } from "./config/cors-options";
import { errorHandler } from "./middlewares/error";

export class App {
  authRoute: AuthRoute;
  app: Express;

  constructor(authRoute: AuthRoute) {
    this.authRoute = authRoute;
    this.app = express();
    this.setMiddlewares();
    this.setRoutes();
    this.handleInvalidRoutes();

    // Make sure handleError is called last
    this.handleError();
  }

  // Middlewares
  setMiddlewares() {
    this.app.use(logger);
    this.app.use(credentials);
    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(cookieParser());
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

  handleError() {
    this.app.use(errorHandler);
  }

  // Start the server
  start(port: string | number) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
