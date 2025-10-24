import "reflect-metadata";
import express from "express";
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
    synchronize: true, // Auto-create tables (alleen dev!)
    logging: true,     // Zie SQL queries in console
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
  app.use(express.json());

  // 3. Routes
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Group routes
  app.use("/groups", createGroupRoutes(dataSource));

  // Category routes
  app.use("/categories", createCategoryRoutes(dataSource));

  // Account routes
  app.use("/accounts", createAccountRoutes(dataSource));

  // Payee routes
  app.use("/payees", createPayeeRoutes(dataSource));

  // Rule routes
  app.use("/rules", createRuleRoutes(dataSource));

  // Transaction routes
  app.use("/transactions", createTransactionRoutes(dataSource));

  // 4. Start server
  const port = 3000;
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

bootstrap().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});