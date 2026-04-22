import { Router } from "express";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { fileURLToPath } from "url";
import Branding from "../models/Branding.js";
import Template from "../models/Template.js";
import { obtenerImagen } from "../../src/agents/images.js";
import { renderSlide } from "../../src/utils/renderStill.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const { templateId, tipo = "carrusel", config = {} } = req.body;

    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Template no encontrado" });

    const branding = await Branding.findOne() || {};
    const jobId = Date.now().toString();
    const carpeta = path.resolve(`out/posts/${jobId}`);
    fs.mkdirSync(carpeta, { recursive: true });

    const colorFondo   = config.colorFondo   || branding.colorFondo   || "#021024";
    const colorPrimario = config.colorPrimario || branding.colorPrimario || "#5483B3";
    const fuente       = config.fuente        || branding.fuente       || "Arial Black";
    const estilo = { colorFondo, colorPrimario, colorTexto: "#ffffff", fuente };
    const cta = template.cta || { texto: branding.ctaTexto, subTexto: branding.ctaSubTexto };
    const logoUrl = branding.logoUrl || null;

    const escenas = tipo === "post"
      ? [template.escenas[0]]
      : template.escenas;

    const totalSlides = escenas.length;
    const archivos = [];

    res.json({ ok: true, jobId, total: totalSlides });

    // Procesar en background
    (async () => {
      for (let i = 0; i < escenas.length; i++) {
        const escena = escenas[i];
        const imgPath = path.join(carpeta, `img_${i + 1}.jpg`);

        try {
          await obtenerImagen(escena, imgPath);
        } catch (e) {
          console.warn(`⚠️  Imagen escena ${i + 1}: ${e.message}`);
        }

        const imgBase64 = fs.existsSync(imgPath)
          ? `data:image/jpeg;base64,${fs.readFileSync(imgPath).toString("base64")}`
          : null;

        const slidePath = path.join(carpeta, `slide_${String(i + 1).padStart(2, "0")}.png`);

        await renderSlide({
          slide: { texto: escena.texto, titulo: template.nombre },
          estilo,
          cta,
          logoUrl,
          indice: i,
          totalSlides,
          imagen: imgBase64,
        }, slidePath);

        archivos.push(slidePath);
        console.log(`✅ Slide ${i + 1}/${totalSlides} renderizado`);
      }

      // Crear ZIP
      const zipPath = path.join(carpeta, `${template.nombre.replace(/\s+/g, "_")}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(output);
      archivos.forEach((f, i) => archive.file(f, { name: path.basename(f) }));
      await archive.finalize();
      console.log(`✅ ZIP creado: ${zipPath}`);

    })().catch(console.error);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:jobId/status", (req, res) => {
  const carpeta = path.resolve(`out/posts/${req.params.jobId}`);
  if (!fs.existsSync(carpeta)) return res.status(404).json({ error: "Job no encontrado" });

  const archivos = fs.readdirSync(carpeta);
  const slides = archivos.filter(f => f.endsWith(".png")).length;
  const zip = archivos.find(f => f.endsWith(".zip"));

  res.json({
    listo: !!zip,
    slides,
    zipUrl: zip ? `/posts/${req.params.jobId}/${zip}` : null,
  });
});

export default router;
