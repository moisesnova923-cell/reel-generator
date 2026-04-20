import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// ── Subtítulo estilo CAJA (original) ─────────────────────────
const SubtituloCaja = ({ texto, colorPrimario, colorTexto }) => {
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
          color: colorTexto || "#ffffff",
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

// ── Palabra animada individual ────────────────────────────────
const Palabra = ({ palabra, frame, indice, colorPrimario, destacar }) => {
  const retraso = indice * 4;
  const frameLocal = Math.max(0, frame - retraso);
  const { fps } = useVideoConfig();

  const y = interpolate(frameLocal, [0, 12], [28, 0], { extrapolateRight: "clamp" });
  const op = interpolate(frameLocal, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const sc = spring({ frame: frameLocal, fps, config: { damping: 18, stiffness: 220 } });

  return (
    <span style={{
      display: "inline-block",
      opacity: op,
      transform: `translateY(${y}px) scale(${sc})`,
      color: destacar ? colorPrimario : "#ffffff",
      marginRight: "0.22em",
      textShadow: "0 2px 24px rgba(0,0,0,1), 0 0 50px rgba(0,0,0,0.9)",
      fontWeight: destacar ? 900 : 800,
    }}>
      {palabra}
    </span>
  );
};

// ── Subtítulo estilo FLUIDO (palabras animadas) ───────────────
const SubtituloFluido = ({ texto, colorPrimario }) => {
  const frame = useCurrentFrame();
  const palabras = texto.split(" ");

  return (
    <div style={{
      position: "absolute", bottom: 280, left: 0, right: 0,
      padding: "0 70px",
      display: "flex", flexWrap: "wrap", justifyContent: "center",
      alignItems: "flex-end", gap: 0,
    }}>
      <div style={{
        fontSize: 52,
        fontFamily: "Arial Black, Impact, sans-serif",
        lineHeight: 1.3,
        textAlign: "center",
      }}>
        {palabras.map((p, i) => (
          <Palabra
            key={i}
            palabra={p}
            frame={frame}
            indice={i}
            colorPrimario={colorPrimario}
            destacar={i % 5 === 2}
          />
        ))}
      </div>
    </div>
  );
};

// ── Exportación principal ─────────────────────────────────────
export const SubtituloEscena = ({ texto, colorPrimario, colorTexto, estiloSubtitulo }) => {
  if (estiloSubtitulo === "fluido") {
    return <SubtituloFluido texto={texto} colorPrimario={colorPrimario} />;
  }
  return <SubtituloCaja texto={texto} colorPrimario={colorPrimario} colorTexto={colorTexto} />;
};
