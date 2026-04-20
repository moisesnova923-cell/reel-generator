import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Vertex AI — Imagen 3 ──────────────────────────────────────

async function generarImagenVertexAI(prompt, outputPath) {
  const keyFile = path.resolve(__dirname, "../../vertex-key.json");
  const projectId = process.env.VERTEX_PROJECT_ID || "edito-de-video-493901";
  const location = process.env.VERTEX_LOCATION || "us-central1";

  const auth = new GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const promptCompleto = `${prompt}. Professional travel photography, ultra high resolution, cinematic lighting, vertical 9:16 format, Instagram Reels style, vivid colors.`;

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

  const { data } = await axios.post(
    endpoint,
    {
      instances: [{ prompt: promptCompleto }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "9:16",
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) throw new Error("Imagen 3 no devolvió imagen");

  const buffer = Buffer.from(base64, "base64");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Imagen 3 generada: ${outputPath}`);
  return outputPath;
}

// ── Pexels (fallback gratuito) ────────────────────────────────

async function buscarImagenPexels(query, outputPath) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error("PEXELS_API_KEY no configurada");

  const { data } = await axios.get("https://api.pexels.com/v1/search", {
    headers: { Authorization: apiKey },
    params: { query, per_page: 5, orientation: "portrait" },
  });

  if (!data.photos?.length) throw new Error(`Pexels sin resultados para "${query}"`);

  const foto = data.photos[Math.floor(Math.random() * data.photos.length)];
  const respuesta = await axios.get(foto.src.large2x || foto.src.large, {
    responseType: "arraybuffer",
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, respuesta.data);
  console.log(`✅ Imagen Pexels: "${query}" → ${outputPath}`);
  return outputPath;
}

// ── Picsum Photos (fallback sin API key) ─────────────────────

async function descargarImagenPicsum(outputPath) {
  // 1080×1920 vertical, seed aleatorio para variedad
  const seed = Math.floor(Math.random() * 1000);
  const url = `https://picsum.photos/seed/${seed}/1080/1920`;
  const respuesta = await axios.get(url, { responseType: "arraybuffer" });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, respuesta.data);
  console.log(`✅ Imagen Picsum (fallback): ${outputPath}`);
  return outputPath;
}

// ── Función principal con fallback automático ─────────────────

const PROMPTS_ALTERNATIVOS = [
  (p) => p,
  (p) => `Travel photography: ${p.split(",")[0]}. Beautiful landscape, professional.`,
  (p) => `${p.split(".")[0]}. Scenic view, high quality photography.`,
];

export async function obtenerImagen(escena, outputPath) {
  const vertexDisponible = fs.existsSync(
    path.resolve(__dirname, "../../vertex-key.json")
  );
  const pexelsDisponible = !!process.env.PEXELS_API_KEY;

  if (vertexDisponible) {
    for (let intento = 0; intento < PROMPTS_ALTERNATIVOS.length; intento++) {
      try {
        const promptFinal = PROMPTS_ALTERNATIVOS[intento](escena.promptImagen);
        if (intento > 0) console.log(`   Reintento ${intento} con prompt simplificado...`);
        return await generarImagenVertexAI(promptFinal, outputPath);
      } catch (err) {
        if (intento === PROMPTS_ALTERNATIVOS.length - 1) {
          console.warn(`⚠️  Imagen 3 falló tras ${PROMPTS_ALTERNATIVOS.length} intentos.`);
          if (pexelsDisponible) console.warn("   Usando Pexels como fallback...");
        }
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  if (pexelsDisponible) {
    return await buscarImagenPexels(
      escena.pexelsQuery || escena.promptImagen,
      outputPath
    );
  }

  // Fallback sin API key: imagen aleatoria vertical de Picsum Photos
  return await descargarImagenPicsum(outputPath);
}

export async function obtenerImagenesParaReel(escenas, carpetaSalida) {
  const rutas = [];
  for (let i = 0; i < escenas.length; i++) {
    const ruta = path.join(carpetaSalida, `escena_${i + 1}.jpg`);
    await obtenerImagen(escenas[i], ruta);
    rutas.push(ruta);
    if (i < escenas.length - 1) await new Promise((r) => setTimeout(r, 1000));
  }
  return rutas;
}
