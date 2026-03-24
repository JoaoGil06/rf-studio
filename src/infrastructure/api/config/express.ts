import express, { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "../docs/swagger.json";
import { userRoutes } from "../../routes/user.route";
import { authRoutes } from "../../routes/auth.route";
import { accountRoutes } from "../../routes/account.route";
import { transactionRoutes } from "../../routes/transaction.route";
import { transactionPersonaRoutes } from "../../routes/transactionPersona.route";
import { ASSETS_DIR } from "../../constants/path";
import { budgetRoutes } from "../../routes/budget.route";
import { potRoutes } from "../../routes/pot.route";
import { rateLimiter } from "../../middlewares/rateLimit.middleware";

export const app: Express = express();
app.use(express.json());

// Middleware to use swagger to docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware para imagens static
// ex.: http://localhost:3000/static/assets/personas/<file>
app.use("/static/assets", express.static(ASSETS_DIR));

// Middleware para implementar Rate Limit em TODAS as rotas
app.use(rateLimiter);

// Routes
userRoutes(app);
authRoutes(app);
accountRoutes(app);
transactionRoutes(app);
transactionPersonaRoutes(app);
budgetRoutes(app);
potRoutes(app);
