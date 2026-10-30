import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import pool from "./db.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "task-manager-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

const port = Number(process.env.PORT || 5000);
try {
  await pool.query("SELECT 1");
  console.log("MySQL connected.");
} catch (err) {
  console.error("MySQL connection failed:", err.message);
}
app.listen(port, () => console.log(`API running at http://localhost:${port}`));
