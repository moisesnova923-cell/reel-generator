import { AbsoluteFill, Audio, Sequence, useVideoConfig, staticFile } from "remotion";
import { Fondo } from "../components/Fondo.jsx";
import { SubtituloEscena } from "../components/Subtitulos.jsx";
import { CTAFinal } from "../components/CTA.jsx";
import { ImagenEscena } from "../components/ImagenEscena.jsx";

export const ReelInstagram = ({ titulo, escenas, audioPath, cta, estilo }) => {
  const { fps } = useVideoConfig();
  const { colorFondo, colorPrimario, colorTexto } = estilo;

  let frameActual = 0;
  const secuencias = escenas.map((escena, i) => {
    const inicio = frameActual;
    const duracion = escena.duracionSegundos * fps;
    frameActual += duracion;
    return { ...escena, inicio, duracion, index: i };
  });

  const duracionTotal = frameActual;
  const inicioCTA = duracionTotal - 3 * fps;

  return (
    <AbsoluteFill>
      <Fondo colorFondo={colorFondo} colorPrimario={colorPrimario} duracionTotal={duracionTotal} />

      {audioPath && <Audio src={staticFile(audioPath)} />}

      {secuencias.map((s) => (
        <Sequence key={s.index} from={s.inicio} durationInFrames={s.duracion}>
          {s.imagen && <ImagenEscena imagen={s.imagen} />}
          <SubtituloEscena
            texto={s.texto}
            colorPrimario={colorPrimario}
            colorTexto={colorTexto}
            esUltima={s.index === secuencias.length - 1}
          />
        </Sequence>
      ))}

      <Sequence from={inicioCTA} durationInFrames={3 * fps}>
        <CTAFinal cta={cta} colorPrimario={colorPrimario} />
      </Sequence>
    </AbsoluteFill>
  );
};
