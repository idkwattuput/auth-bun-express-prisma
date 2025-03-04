import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./middlewares/log";
import { verifyJWT } from "./middlewares/jwt";
import authRouter from "./routes/auth-route";
import { credentials } from "./middlewares/credentials";
import { corsOptions } from "./config/cors-options";
import { errorHandler } from "./middlewares/error";

export const app = express();
const PORT = Bun.env.PORT;

// Middlewares
app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes that dont need verify JWT
app.use("/api/v1/auth", authRouter);

app.use(verifyJWT);

// NOTE:
// Routes that need verify JWT
// example:
// app.use("/api/v1/todos", todosRoute)
//              OR
// you can verify JWT on routes file
// example:
// router.route("/").get(verifyJWT, todoController.getTodos)

// Handling non-existent routes
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Make sure errorHandler is called last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server has started on ${PORT}`);
});
