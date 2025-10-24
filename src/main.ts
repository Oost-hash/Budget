import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import { CategoryEntity } from "@infrastructure/database/entities/CategoryEntity";
import { GroupEntity } from "@infrastructure/database/entities/GroupEntity";
import { createGroupRoutes } from "@infrastructure/http/routes/GroupRoutes";
import { createCategoryRoutes } from "@infrastructure/http/routes/CategoryRoutes";

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