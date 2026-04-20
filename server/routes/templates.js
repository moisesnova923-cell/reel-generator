import { Router } from "express";
import Template from "../models/Template.js";

const router = Router();

router.get("/", async (req, res) => {
  const templates = await Template.find({ activo: true }).sort({ createdAt: -1 });
  res.json(templates);
});

router.get("/:id", async (req, res) => {
  const t = await Template.findById(req.params.id);
  if (!t) return res.status(404).json({ error: "No encontrado" });
  res.json(t);
});

router.post("/", async (req, res) => {
  const t = await Template.create(req.body);
  res.status(201).json(t);
});

router.put("/:id", async (req, res) => {
  const t = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(t);
});

router.delete("/:id", async (req, res) => {
  await Template.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ ok: true });
});

export default router;
