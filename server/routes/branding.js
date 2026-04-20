import { Router } from "express";
import Branding from "../models/Branding.js";

const router = Router();

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

export default router;
