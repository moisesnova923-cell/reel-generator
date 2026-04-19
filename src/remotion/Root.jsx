import { Composition } from "remotion";
import { ReelInstagram } from "./compositions/ReelInstagram.jsx";

export const RemotionRoot = () => (
  <Composition
    id="ReelInstagram"
    component={ReelInstagram}
    durationInFrames={1200}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{
      titulo: "¿Listo para viajar a Europa?",
      escenas: [
        { texto: "Viajar a España nunca fue tan fácil", duracionSegundos: 10, imagen: null },
        { texto: "Seguro, hotel y retorno incluidos", duracionSegundos: 10, imagen: null },
        { texto: "28,000 pasajeros ya confiaron en nosotros", duracionSegundos: 10, imagen: null },
        { texto: "Las tarifas cambian cada 12 horas", duracionSegundos: 10, imagen: null },
      ],
      audioPath: null,
      cta: { texto: "✈ ESCRÍBENOS AHORA", subTexto: "Cupos limitados" },
      estilo: {
        colorFondo: "#0a0a1a",
        colorPrimario: "#f0c040",
        colorTexto: "#ffffff",
        fuente: "Arial Black",
      },
    }}
  />
);
