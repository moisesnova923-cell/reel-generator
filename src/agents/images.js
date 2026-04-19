import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada en .env");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generarImagen(prompt, outputPath, opciones = {}) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });

  const promptCompleto = `${prompt}. Estilo: fotografía profesional, alta resolución, iluminación cinematográfica, aspecto ratio 9:16 vertical para Instagram Reels.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: promptCompleto }] }],
    generationConfig: { responseModalities: ["image", "text"] },
  });

  const parts = result.response.candidates[0].content.parts;
  const imgPart = parts.find((p) => p.inlineData);

  if (!imgPart) throw new Error("Gemini no devolvió imagen. Verifica tu API key y acceso a Imagen.");

  const buffer = Buffer.from(imgPart.inlineData.data, "base64");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Imagen generada: ${outputPath}`);
  return outputPath;
}

export async function generarImagenesParaReel(escenas, carpetaSalida) {
  const rutas = [];
  for (let i = 0; i < escenas.length; i++) {
    const ruta = path.join(carpetaSalida, `escena_${i + 1}.png`);
    await generarImagen(escenas[i].promptImagen, ruta);
    rutas.push(ruta);
    // Pausa para evitar rate limiting
    if (i < escenas.length - 1) await new Promise((r) => setTimeout(r, 1500));
  }
  return rutas;
}
