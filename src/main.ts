import dotenv from "dotenv";
import { startServer } from "./infrastructure/api/config/server";
import { PORT } from "./infrastructure/constants/env";

dotenv.config();
const port: number = Number(PORT);

startServer(port);
