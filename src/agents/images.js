import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Vertex AI — Imagen 3 ──────────────────────────────────────

async function generarImagenVertexAI(prompt, outputPath) {
  const projectId = process.env.VERTEX_PROJECT_ID || "edito-de-video-493901";
  const location = process.env.VERTEX_LOCATION || "us-central1";

  // Credenciales: variable de entorno VERTEX_KEY_JSON (JSON como string) o archivo local
  let authConfig;
  if (process.env.VERTEX_KEY_JSON) {
    authConfig = { credentials: JSON.parse(process.env.VERTEX_KEY_JSON), scopes: ["https://www.googleapis.com/auth/cloud-platform"] };
  } else {
    const keyFile = path.resolve(__dirname, "../../vertex-key.json");
    authConfig = { keyFile, scopes: ["https://www.googleapis.com/auth/cloud-platform"] };
  }

  const auth = new GoogleAuth(authConfig);

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const promptCompleto = `${prompt}. Professional travel photography, ultra high resolution, cinematic lighting, vertical 9:16 format, Instagram Reels style, vivid colors.`;

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

  console.log(`🖼  Vertex AI → proyecto: ${projectId} | location: ${location}`);
  console.log(`🖼  Prompt: ${promptCompleto.substring(0, 120)}...`);
  console.log(`🔑  Token obtenido: ${token.token ? "OK" : "VACÍO"}`);

  let data;
  try {
    const resp = await axios.post(
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
    data = resp.data;
    console.log(`✅ Vertex respondió HTTP 200`);
  } catch (axiosErr) {
    const status = axiosErr.response?.status;
    const body = JSON.stringify(axiosErr.response?.data || axiosErr.message);
    console.error(`❌ Vertex HTTP ${status}: ${body}`);
    throw new Error(`Vertex HTTP ${status}: ${body}`);
  }

  console.log(`📦 Predictions recibidas: ${data.predictions?.length ?? 0}`);
  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) {
    console.error(`❌ Vertex no devolvió imagen. Respuesta completa: ${JSON.stringify(data)}`);
    throw new Error(`Vertex no devolvió imagen. Respuesta: ${JSON.stringify(data)}`);
  }

  const buffer = Buffer.from(base64, "base64");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Imagen 3 generada: ${outputPath}`);
  return outputPath;
}

// ── Función principal — solo Vertex AI ───────────────────────

const PROMPTS_ALTERNATIVOS = [
  (p) => p,
  (p) => `Travel photography: ${p.split(",")[0]}. Beautiful landscape, professional.`,
  (p) => `${p.split(".")[0]}. Scenic view, high quality photography.`,
];

export async function obtenerImagen(escena, outputPath) {
  for (let intento = 0; intento < PROMPTS_ALTERNATIVOS.length; intento++) {
    try {
      const promptFinal = PROMPTS_ALTERNATIVOS[intento](escena.promptImagen);
      if (intento > 0) console.log(`   Reintento ${intento} con prompt simplificado...`);
      return await generarImagenVertexAI(promptFinal, outputPath);
    } catch (err) {
      console.warn(`⚠️  Vertex intento ${intento + 1} falló: ${err.message}`);
      if (intento < PROMPTS_ALTERNATIVOS.length - 1) await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw new Error("Vertex AI no pudo generar la imagen tras 3 intentos.");
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
