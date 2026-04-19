import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const Fondo = ({ colorFondo, colorPrimario, duracionTotal }) => {
  const frame = useCurrentFrame();
  const angulo = interpolate(frame, [0, duracionTotal], [135, 200]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angulo}deg, ${colorFondo} 0%, #1a0a2e 50%, #0d1a3a 100%)`,
      }}
    >
      {/* Línea superior */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 6,
        background: `linear-gradient(90deg, transparent, ${colorPrimario}, transparent)`,
      }} />
      {/* Línea inferior */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 6,
        background: `linear-gradient(90deg, transparent, ${colorPrimario}, transparent)`,
      }} />
    </AbsoluteFill>
  );
};
