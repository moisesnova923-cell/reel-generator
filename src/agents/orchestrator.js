import path from "path";
import { generarVozOff } from "./voice.js";
import { generarImagenesParaReel } from "./images.js";
import { renderizarReel } from "../utils/render.js";

export async function crearReel(template) {
  const { id, titulo, escenas, cta, estilo } = template;
  const carpeta = path.resolve(`out/${id}`);

  console.log(`\n🎬 Iniciando generación de reel: "${titulo}"`);
  console.log("─".repeat(50));

  // 1. Construir guión completo para voz en off
  const guion = escenas.map((e) => e.texto).join(" ");
  console.log("\n🎙️  Generando voz en off...");
  const audioPath = await generarVozOff(guion, path.join(carpeta, "naracion.mp3"), {
    voiceId: estilo?.voiceId,
    estabilidad: estilo?.estabilidad,
  });

  // 2. Generar imágenes con Gemini
  console.log("\n🖼️  Generando imágenes con Gemini...");
  const imagenes = await generarImagenesParaReel(escenas, path.join(carpeta, "imagenes"));

  // 3. Armar props para Remotion
  const props = {
    titulo,
    escenas: escenas.map((e, i) => ({
      texto: e.texto,
      imagen: imagenes[i],
      duracionSegundos: e.duracion || 8,
    })),
    audioPath,
    cta,
    estilo: {
      colorFondo: estilo?.colorFondo || "#0a0a1a",
      colorPrimario: estilo?.colorPrimario || "#f0c040",
      colorTexto: "#ffffff",
      fuente: estilo?.fuente || "Arial Black",
    },
  };

  // 4. Renderizar con Remotion
  console.log("\n🎞️  Renderizando video...");
  const videoPath = await renderizarReel(props, path.join(carpeta, "reel.mp4"));

  console.log(`\n✅ ¡Reel listo! → ${videoPath}`);
  return videoPath;
}
