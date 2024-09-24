import { App } from "./app";
import { prisma } from "./database/db";
import { UserRepository } from "./repositories/user-repository";
import { AuthController } from "./controllers/auth-controller";
import { AuthRoute } from "./routes/auth-route";

const PORT = Bun.env.PORT!;
const userRepository = new UserRepository(prisma);
const authController = new AuthController(userRepository);
const authRoute = new AuthRoute(authController);

const app = new App(authRoute);

app.start(PORT);
