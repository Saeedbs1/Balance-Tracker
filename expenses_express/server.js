require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET;
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER ,
  password: process.env.DB_PASS ,
  database: process.env.DB_NAME,
    ssl: {
    rejectUnauthorized: false
  }
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (rows.length > 0)
      return res.status(400).json({ error: "Username exists" });
    const hashed = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashed,
    ]);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: rows[0].id, username }, SECRET, {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(header.split(" ")[1], SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/api/entries", auth, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM entries WHERE user_id = ?",
      [req.user.userId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/entries", auth, async (req, res) => {
  try {
    const { title, amount, category, currency, date, type } = req.body;
    const [result] = await db.query(
      "INSERT INTO entries (title, amount, category, currency, date, type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, amount, category, currency, date, type, req.user.userId]
    );
    res.status(201).json({
      id: result.insertId,
      title,
      amount,
      category,
      currency,
      date,
      type,
      user_id: req.user.userId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/entries/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("DELETE FROM entries WHERE id = ? AND user_id = ?", [
      id,
      req.user.userId,
    ]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/budgets", auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const [rows] = await db.query(
      "SELECT * FROM budgets WHERE year = ? AND month = ? AND user_id = ?",
      [year, month, req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/budgets", auth, async (req, res) => {
  try {
    const { category, year, month, amount } = req.body;
    await db.query(
      `
      INSERT INTO budgets (category, year, month, amount, user_id)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE amount = VALUES(amount)
    `,
      [category, year, month, amount, req.user.userId]
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
