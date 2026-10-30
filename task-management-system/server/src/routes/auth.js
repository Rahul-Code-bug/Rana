import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return res.status(400).json({ message: "Enter a valid name, email and password (minimum 8 characters)." });
    }
    const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ message: "An account with this email already exists." });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email, hash]
    );
    const user = { id: result.insertId, name, email };
    res.status(201).json({ token: makeToken(user), user });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const [rows] = await pool.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    const { id, name } = rows[0];
    const user = { id, name, email: rows[0].email };
    res.json({ token: makeToken(user), user });
  } catch (err) { next(err); }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT id, name, email FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "User not found." });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
});

export default router;
