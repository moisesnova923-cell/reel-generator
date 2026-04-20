import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Efectos Ken Burns: cada escena tiene uno distinto
const EFECTOS = [
  (f, dur) => ({ scale: interpolate(f, [0, dur], [1.0, 1.12]), x: 0, y: 0 }),
  (f, dur) => ({ scale: interpolate(f, [0, dur], [1.1, 1.0]),  x: interpolate(f, [0, dur], [-25, 0]), y: 0 }),
  (f, dur) => ({ scale: 1.08, x: interpolate(f, [0, dur], [0, 30]), y: interpolate(f, [0, dur], [0, -20]) }),
  (f, dur) => ({ scale: interpolate(f, [0, dur], [1.12, 1.0]), x: interpolate(f, [0, dur], [20, -10]), y: 0 }),
  (f, dur) => ({ scale: interpolate(f, [0, dur], [1.0, 1.1]),  x: 0, y: interpolate(f, [0, dur], [15, -15]) }),
];

export const ImagenEscena = ({ imagen, indiceEscena = 0, estiloTransicion = "suave" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const efecto = EFECTOS[indiceEscena % EFECTOS.length](frame, durationInFrames);
  const opacidad = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0]
  );

  // Transición dinámica: leve destello blanco al inicio
  const destello = estiloTransicion === "dinamico"
    ? interpolate(frame, [0, 6], [0.18, 0], { extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <Img
        src={imagen}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${efecto.scale}) translate(${efecto.x}px, ${efecto.y}px)`,
          filter: "brightness(0.42)",
          willChange: "transform",
        }}
      />
      {destello > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          background: `rgba(255,255,255,${destello})`,
          pointerEvents: "none",
        }} />
      )}
    </AbsoluteFill>
  );
};
