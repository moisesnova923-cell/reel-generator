import { Router } from "express";
import multer from "multer";
import Branding from "../models/Branding.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"));
  },
});

router.get("/", async (req, res) => {
  let b = await Branding.findOne();
  if (!b) b = await Branding.create({});
  res.json(b);
});

router.put("/", async (req, res) => {
  let b = await Branding.findOne();
  if (!b) b = new Branding();
  Object.assign(b, req.body);
  await b.save();
  res.json(b);
});

router.post("/logo", upload.single("logo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió imagen" });
  const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  let b = await Branding.findOne();
  if (!b) b = new Branding();
  b.logoUrl = base64;
  await b.save();
  res.json({ ok: true, logoUrl: base64 });
});

export default router;
