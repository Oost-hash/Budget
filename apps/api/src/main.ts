import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import { readRateLimiter, writeRateLimiter } from "@infrastructure/http/middleware/rateLimiter";
import { DataSource } from "typeorm";
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
  // 1. Database setup
  const dataSource = new DataSource({
    type: "better-sqlite3",
    database: "./data/budget.sqlite",
    synchronize: true, // TODO: Disable in production, use migrations (Issue #15)
    logging: true,     // TODO: Disable in production (Issue #15)
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
    // Allow cross-origin in development (frontend on different port)
    // Strict policy in production (everything same origin)
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  }));

  // CORS middleware - Only in development (dynamic import)
  // In production, frontend and backend served from same origin (no CORS needed)
  if (process.env.NODE_ENV !== 'production') {
    const { default: cors } = await import('cors');
    app.use(cors({
      origin: 'http://localhost:5173', // Vite dev server
      credentials: true
    }));
  }

  app.use(express.json());

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
  // In production, the frontend build will be in /app/public
  // In development, Vite dev server handles this
  if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    const publicPath = path.join(__dirname, '../public');

    // Serve static files
    app.use(express.static(publicPath));

    // SPA fallback - send index.html for all non-API routes
    app.use((_req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  // 5. Start server
  const port = 3000;
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

bootstrap().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});