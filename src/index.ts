import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./middlewares/log";
import { verifyJWT } from "./middlewares/jwt";
import router from "./routes/auth-route";

const app = express();
const PORT = Bun.env.PORT;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(cookieParser());

// Routes that dont need verify JWT
app.use("/api/v1/auth", router);

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

app.listen(PORT, () => {
  console.log(`Server has started on ${PORT}`);
});
