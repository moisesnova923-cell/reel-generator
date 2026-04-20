import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "dotenv/config";

import brandingRouter from "./routes/branding.js";
import templatesRouter from "./routes/templates.js";
import reelsRouter from "./routes/reels.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir panel web
app.use(express.static(path.resolve(__dirname, "../panel")));

// Servir videos generados
const outDir = path.resolve(__dirname, "../out");
fs.mkdirSync(outDir, { recursive: true });
app.use("/videos", express.static(outDir));

// API routes
app.use("/api/branding", brandingRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/reels", reelsRouter);

// Listar voces ElevenLabs
app.get("/api/voices", async (req, res) => {
  try {
    const { default: axios } = await import("axios");
    const { data } = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
    });
    const voces = data.voices
      .map((v) => {
        const idioma =
          v.labels?.language ||
          v.labels?.accent ||
          v.fine_tuning?.language ||
          v.language ||
          "en";
        return {
          id: v.voice_id,
          nombre: v.name,
          categoria: v.category,
          labels: v.labels,
          previewUrl: v.preview_url,
          idioma: idioma.toLowerCase(),
          genero: (v.labels?.gender || "").toLowerCase(),
        };
      })
      .sort((a, b) => {
        // Español primero, luego inglés, luego resto
        const prioridadIdioma = (i) => {
          if (i.startsWith("es")) return 0;
          if (i.startsWith("en")) return 1;
          return 2;
        };
        const diff = prioridadIdioma(a.idioma) - prioridadIdioma(b.idioma);
        if (diff !== 0) return diff;
        // Dentro del mismo idioma: femeninas primero
        const fA = a.genero === "female" ? 0 : 1;
        const fB = b.genero === "female" ? 0 : 1;
        return fA - fB;
      });
    res.json(voces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed inicial
app.post("/api/seed", async (req, res) => {
  try {
    const { runSeed } = await import("./seed.js");
    const result = await runSeed();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback → panel
app.get("/{*path}", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../panel/index.html"));
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    app.listen(PORT, () => console.log(`🚀 Panel corriendo en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Error MongoDB:", err.message);
    process.exit(1);
  });
