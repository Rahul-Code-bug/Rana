import { Router } from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const statuses = ["Pending", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];

function validateTask(body) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const status = body.status || "Pending";
  const priority = body.priority || "Medium";
  const dueDate = body.due_date || null;
  if (!title || title.length > 180) return { error: "Title is required and must be under 180 characters." };
  if (!statuses.includes(status)) return { error: "Invalid task status." };
  if (!priorities.includes(priority)) return { error: "Invalid task priority." };
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: "Due date must use YYYY-MM-DD." };
  return { value: { title, description, status, priority, dueDate } };
}

router.get("/", async (req, res, next) => {
  try {
    const { search = "", status = "", priority = "" } = req.query;
    const clauses = ["user_id = ?"];
    const values = [req.user.id];
    if (search) { clauses.push("(title LIKE ? OR description LIKE ?)"); values.push(`%${search}%`, `%${search}%`); }
    if (statuses.includes(status)) { clauses.push("status = ?"); values.push(status); }
    if (priorities.includes(priority)) { clauses.push("priority = ?"); values.push(priority); }
    const [rows] = await pool.execute(
      `SELECT id, title, description, status, priority, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date, created_at, updated_at
       FROM tasks WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`, values
    );
    res.json({ tasks: rows });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const checked = validateTask(req.body);
    if (checked.error) return res.status(400).json({ message: checked.error });
    const t = checked.value;
    const [result] = await pool.execute(
      "INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, t.title, t.description, t.status, t.priority, t.dueDate]
    );
    const [rows] = await pool.execute(
      "SELECT id, title, description, status, priority, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM tasks WHERE id = ? AND user_id = ?",
      [result.insertId, req.user.id]
    );
    res.status(201).json({ task: rows[0] });
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const checked = validateTask(req.body);
    if (checked.error) return res.status(400).json({ message: checked.error });
    const t = checked.value;
    const [result] = await pool.execute(
      "UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?",
      [t.title, t.description, t.status, t.priority, t.dueDate, req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Task not found." });
    const [rows] = await pool.execute(
      "SELECT id, title, description, status, priority, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date FROM tasks WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ task: rows[0] });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (err) { next(err); }
});

export default router;
