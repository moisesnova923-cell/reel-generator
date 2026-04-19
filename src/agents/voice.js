import axios from "axios";
import fs from "fs";
import path from "path";

const BASE_URL = "https://api.elevenlabs.io/v1";

export async function generarVozOff(texto, outputPath, opciones = {}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = opciones.voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  if (!apiKey) throw new Error("ELEVENLABS_API_KEY no está configurada en .env");

  const response = await axios.post(
    `${BASE_URL}/text-to-speech/${voiceId}`,
    {
      text: texto,
      model_id: opciones.modelo || "eleven_multilingual_v2",
      voice_settings: {
        stability: opciones.estabilidad ?? 0.5,
        similarity_boost: opciones.similitud ?? 0.75,
        style: opciones.estilo ?? 0.3,
        use_speaker_boost: true,
      },
    },
    {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, response.data);
  console.log(`✅ Audio generado: ${outputPath}`);
  return outputPath;
}

export async function listarVoces() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY no está configurada en .env");

  const { data } = await axios.get(`${BASE_URL}/voices`, {
    headers: { "xi-api-key": apiKey },
  });

  return data.voices.map((v) => ({ id: v.voice_id, nombre: v.name, categoria: v.category }));
}
