import "dotenv/config";
import { crearReel } from "./agents/orchestrator.js";
import { templateViajesMigratorio, templateTour } from "./templates/viajes.js";

// ── Elige el template a generar ──────────────────────────────
const TEMPLATE = templateViajesMigratorio;
// const TEMPLATE = templateTour;

// ── También puedes crear un template personalizado aquí ──────
// const TEMPLATE = {
//   id: "mi-reel-01",
//   titulo: "Mi título personalizado",
//   escenas: [
//     { texto: "Texto escena 1", duracion: 10, promptImagen: "beautiful sunset over ocean" },
//     { texto: "Texto escena 2", duracion: 10, promptImagen: "luxury hotel pool" },
//   ],
//   cta: { texto: "CONTÁCTANOS", subTexto: "Disponible 24/7" },
//   estilo: { colorFondo: "#0a0a1a", colorPrimario: "#f0c040" },
// };

crearReel(TEMPLATE).catch((err) => {
  console.error("❌ Error generando reel:", err.message);
  process.exit(1);
});
