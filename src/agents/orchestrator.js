import path from "path";
import fs from "fs";
import { generarVozOff } from "./voice.js";
import { obtenerImagenesParaReel } from "./images.js";
import { renderizarReel } from "../utils/render.js";

function toDataUrl(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === "mp3" ? "audio/mpeg" : `image/${ext === "jpg" ? "jpeg" : ext}`;
  const data = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${data}`;
}

export async function crearReel(template) {
  const { id, titulo, escenas, cta, estilo } = template;
  const carpeta = path.resolve(`out/${id}`);

  console.log(`\n🎬 Iniciando generación de reel: "${titulo}"`);
  console.log("─".repeat(50));

  // 1. Voz en off
  const guion = escenas.map((e) => e.texto).join(" ");
  console.log("\n🎙️  Generando voz en off...");
  const audioPath = await generarVozOff(guion, path.join(carpeta, "naracion.mp3"), {
    voiceId: estilo?.voiceId,
    estabilidad: estilo?.estabilidad,
  });

  // 2. Imágenes
  console.log(`\n🖼️  Obteniendo imágenes vía Imagen 3...`);
  const imagenes = await obtenerImagenesParaReel(escenas, path.join(carpeta, "imagenes"));

  // 3. Convertir a base64 para pasar directo a Remotion
  console.log("\n📦 Preparando assets...");
  const audioBase64 = toDataUrl(audioPath);
  const imagenesBase64 = imagenes.map(toDataUrl);

  // 4. Props para Remotion
  const props = {
    titulo,
    escenas: escenas.map((e, i) => ({
      texto: e.texto,
      imagen: imagenesBase64[i],
      duracionSegundos: e.duracion || 10,
    })),
    audioPath: audioBase64,
    cta,
    estilo: {
      colorFondo: estilo?.colorFondo || "#0a0a1a",
      colorPrimario: estilo?.colorPrimario || "#f0c040",
      colorTexto: "#ffffff",
      fuente: estilo?.fuente || "Arial Black",
    },
  };

  // 5. Renderizar
  console.log("\n🎞️  Renderizando video...");
  const videoPath = await renderizarReel(props, path.join(carpeta, "reel.mp4"));

  console.log(`\n✅ ¡Reel listo! → ${videoPath}`);
  return videoPath;
}
