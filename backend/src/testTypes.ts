import express from "express";

const app = express();

app.get("/", (req, res) => {
  // ✅ If your augmentation works, TS will recognize req.user
  res.json({ userId: req.user?.id });
});
