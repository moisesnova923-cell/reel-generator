import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const SubtituloEscena = ({ texto, colorPrimario, colorTexto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const escala = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const opacidad = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", bottom: 340, left: 0, right: 0,
      display: "flex", justifyContent: "center",
      padding: "0 60px",
      opacity: opacidad,
      transform: `scale(${escala})`,
    }}>
      <div style={{
        background: "rgba(0,0,0,0.78)",
        borderLeft: `8px solid ${colorPrimario}`,
        borderRadius: 14,
        padding: "22px 38px",
        maxWidth: 880,
      }}>
        <p style={{
          color: colorTexto,
          fontSize: 50,
          fontFamily: "Arial Black, sans-serif",
          fontWeight: 900,
          margin: 0,
          lineHeight: 1.35,
          textAlign: "center",
          textShadow: "0 2px 14px rgba(0,0,0,0.9)",
        }}>
          {texto}
        </p>
      </div>
    </div>
  );
};
