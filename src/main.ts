import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";

async function bootstrap() {
  // 1. Database setup
  const dataSource = new DataSource({
    type: "better-sqlite3",
    database: "./data/budget.sqlite",
    synchronize: true, // Auto-create tables (alleen dev!)
    logging: false,
    entities: [] // Later vullen we dit met entities
  });

  await dataSource.initialize();
  console.log("✅ Database connected");

  // 2. Express setup
  const app = express();
  app.use(express.json());

  // 3. Routes
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

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