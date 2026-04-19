import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const CTAFinal = ({ cta, colorPrimario }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const escala = spring({ frame, fps, config: { damping: 10, stiffness: 220 } });
  const opacidad = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const pulso = 1 + 0.03 * Math.sin((frame / 12) * Math.PI);

  return (
    <div style={{
      position: "absolute", bottom: 130, left: 0, right: 0,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      opacity: opacidad,
    }}>
      <div style={{
        background: colorPrimario,
        borderRadius: 60,
        padding: "26px 80px",
        transform: `scale(${escala * pulso})`,
        boxShadow: `0 0 40px ${colorPrimario}80`,
      }}>
        <p style={{
          color: "#000",
          fontSize: 44,
          fontFamily: "Arial Black, sans-serif",
          fontWeight: 900,
          margin: 0,
        }}>
          {cta.texto}
        </p>
      </div>
      {cta.subTexto && (
        <p style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 30,
          fontFamily: "Arial, sans-serif",
          margin: 0,
          letterSpacing: 1,
        }}>
          {cta.subTexto}
        </p>
      )}
    </div>
  );
};
