import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import { DataSource } from "typeorm";
import { config, validateConfig } from "./config";
import { createReadRateLimiter, createWriteRateLimiter } from "@infrastructure/http/middleware/rateLimiter";
import { CategoryEntity } from "@infrastructure/database/entities/CategoryEntity";
import { GroupEntity } from "@infrastructure/database/entities/GroupEntity";
import { AccountEntity } from "@infrastructure/database/entities/AccountEntity";
import { PayeeEntity } from "@infrastructure/database/entities/PayeeEntity";
import { RuleEntity } from "@infrastructure/database/entities/RuleEntity";
import { TransactionEntity } from "@infrastructure/database/entities/TransactionEntity";
import { EntryEntity } from "@infrastructure/database/entities/EntryEntity";
import { createGroupRoutes } from "@infrastructure/http/routes/GroupRoutes";
import { createCategoryRoutes } from "@infrastructure/http/routes/CategoryRoutes";
import { createAccountRoutes } from "@infrastructure/http/routes/AccountRoutes";
import { createPayeeRoutes } from "@infrastructure/http/routes/PayeeRoutes";
import { createRuleRoutes } from "@infrastructure/http/routes/RuleRoutes";
import { createTransactionRoutes } from "@infrastructure/http/routes/TransactionRoutes";

async function bootstrap() {
  // Validate configuration
  validateConfig();

  // 1. Database setup
  const dataSource = new DataSource({
    type: "better-sqlite3",
    database: config.database.path,
    synchronize: config.database.synchronize,
    logging: config.database.logging,
    entities: [
      CategoryEntity,
      GroupEntity,
      AccountEntity,
      PayeeEntity,
      RuleEntity,
      TransactionEntity,
      EntryEntity,
    ]
  });

  await dataSource.initialize();
  console.log("✅ Database connected");

  // 2. Express setup
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind needs inline styles
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: config.isProduction,
  }));

  // CORS middleware - Only in development
  if (config.isDevelopment) {
    const { default: cors } = await import('cors');
    app.use(cors({
      origin: config.cors.origins,
      credentials: true
    }));
  }

  app.use(express.json());

  // 3. Rate limiting - use config values
  const readRateLimiter = createReadRateLimiter(config.rateLimit.read);
  const writeRateLimiter = createWriteRateLimiter(config.rateLimit.write);

  app.use('/api', readRateLimiter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // API Router - all business routes under /api prefix
  const apiRouter = express.Router();

  // Apply write rate limiter to specific HTTP methods
  apiRouter.use((req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      writeRateLimiter(req, res, next);
    } else {
      next();
    }
  });

  apiRouter.use("/groups", createGroupRoutes(dataSource));
  apiRouter.use("/categories", createCategoryRoutes(dataSource));
  apiRouter.use("/accounts", createAccountRoutes(dataSource));
  apiRouter.use("/payees", createPayeeRoutes(dataSource));
  apiRouter.use("/rules", createRuleRoutes(dataSource));
  apiRouter.use("/transactions", createTransactionRoutes(dataSource));

  // Mount API router
  app.use("/api", apiRouter);

  // 4. Static files (production only)
  if (config.isProduction) {
    const path = require('path');
    const publicPath = path.join(__dirname, '../public');

    app.use(express.static(publicPath));

    // SPA fallback - send index.html for all non-API routes
    app.use((_req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  // 5. Start server
  app.listen(config.port, () => {
    console.log(`✅ Server running on http://localhost:${config.port}`);
    console.log(`📊 Environment: ${config.env}`);
    console.log(`🗄️  Database: ${config.database.path}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});