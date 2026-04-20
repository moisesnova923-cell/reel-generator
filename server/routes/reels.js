import { Router } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Reel from "../models/Reel.js";
import Branding from "../models/Branding.js";
import Template from "../models/Template.js";
import { generarVozOff } from "../../src/agents/voice.js";
import { obtenerImagenesParaReel } from "../../src/agents/images.js";
import { renderizarReel } from "../../src/utils/render.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

function toDataUrl(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === "mp3" ? "audio/mpeg" : `image/${ext === "jpg" ? "jpeg" : ext}`;
  const data = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${data}`;
}

router.get("/", async (req, res) => {
  const reels = await Reel.find().sort({ createdAt: -1 }).limit(20);
  res.json(reels);
});

router.get("/:id/status", async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return res.status(404).json({ error: "No encontrado" });
  res.json({ status: reel.status, progreso: reel.progreso, videoUrl: reel.videoUrl, errorMsg: reel.errorMsg });
});

router.post("/generate", async (req, res) => {
  try {
    const { templateId, config = {} } = req.body;

    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Template no encontrado" });

    const branding = await Branding.findOne() || {};

    const reel = await Reel.create({
      titulo: template.nombre,
      templateId: template._id,
      config,
      status: "pendiente",
    });

    res.json({ reelId: reel._id });

    procesarReel(reel, template, branding, config).catch(console.error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function procesarReel(reel, template, branding, config) {
  const reelId = reel._id.toString();
  const carpeta = path.resolve(`out/${reelId}`);
  fs.mkdirSync(carpeta, { recursive: true });

  try {
    await Reel.findByIdAndUpdate(reelId, { status: "procesando", progreso: 5 });

    const voiceId = config.voiceId || branding.voiceId || "EXAVITQu4vr4xnSDxMaL";
    const guion = template.escenas.map((e) => e.texto).join(" ");
    const audioPath = await generarVozOff(guion, path.join(carpeta, "naracion.mp3"), {
      voiceId,
      estabilidad: config.estabilidadVoz ?? branding.estabilidadVoz ?? 0.6,
      similarityBoost: config.similarityVoz ?? branding.similarityVoz ?? 0.8,
      speed: config.velocidadVoz ?? branding.velocidadVoz ?? 0.9,
    });
    await Reel.findByIdAndUpdate(reelId, { progreso: 20 });

    const imagenes = await obtenerImagenesParaReel(template.escenas, path.join(carpeta, "imagenes"));
    await Reel.findByIdAndUpdate(reelId, { progreso: 50 });

    const audioBase64 = toDataUrl(audioPath);
    const imagenesBase64 = imagenes.map(toDataUrl);

    const colorFondo = config.colorFondo || branding.colorFondo || "#0a0a1a";
    const colorPrimario = config.colorPrimario || branding.colorPrimario || "#f0c040";
    const fuente = config.fuente || branding.fuente || "Arial Black";

    const props = {
      titulo: template.nombre,
      escenas: template.escenas.map((e, i) => ({
        texto: e.texto,
        imagen: imagenesBase64[i],
        duracionSegundos: e.duracion || 10,
      })),
      audioPath: audioBase64,
      cta: template.cta || { texto: branding.ctaTexto, subTexto: branding.ctaSubTexto },
      estilo: { colorFondo, colorPrimario, colorTexto: "#ffffff", fuente },
    };

    const videoPath = path.join(carpeta, "reel.mp4");

    await renderizarReel(props, videoPath, (progress) => {
      const p = 50 + Math.round(progress * 50);
      Reel.findByIdAndUpdate(reelId, { progreso: p }).catch(() => {});
    });

    await Reel.findByIdAndUpdate(reelId, {
      status: "listo",
      progreso: 100,
      videoUrl: `/videos/${reelId}/reel.mp4`,
    });
  } catch (err) {
    await Reel.findByIdAndUpdate(reelId, { status: "error", errorMsg: err.message });
  }
}

export default router;
