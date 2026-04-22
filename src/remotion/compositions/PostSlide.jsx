import { AbsoluteFill, Img, useCurrentFrame, interpolate, staticFile } from "remotion";

export const PostSlide = ({ slide, estilo, cta, logoUrl, esSlide, totalSlides, indice }) => {
  const frame = useCurrentFrame();
  const { colorFondo, colorPrimario, colorTexto = "#ffffff", fuente = "Arial Black" } = estilo;

  const op = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colorFondo, opacity: op }}>

      {/* Imagen de fondo */}
      {slide.imagen && (
        <AbsoluteFill>
          <Img
            src={slide.imagen}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.38)" }}
          />
        </AbsoluteFill>
      )}

      {/* Gradiente inferior */}
      <AbsoluteFill style={{
        background: `linear-gradient(to top, ${colorFondo}f0 0%, ${colorFondo}80 40%, transparent 70%)`,
      }} />

      {/* Indicador de slide (carrusel) */}
      {totalSlides > 1 && (
        <div style={{
          position: "absolute", top: 70, right: 70,
          background: "rgba(0,0,0,0.6)", borderRadius: 30,
          padding: "10px 24px", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ color: colorPrimario, fontSize: 28, fontFamily: fuente, fontWeight: 900 }}>
            {indice + 1}
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 24 }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 24 }}>{totalSlides}</span>
        </div>
      )}

      {/* Logo */}
      {logoUrl && (
        <div style={{ position: "absolute", top: 60, left: 70 }}>
          <Img src={logoUrl} style={{ height: 64, objectFit: "contain" }} />
        </div>
      )}

      {/* Línea decorativa */}
      <div style={{
        position: "absolute", bottom: 380, left: 70,
        width: 80, height: 6, borderRadius: 3,
        background: colorPrimario,
      }} />

      {/* Texto principal */}
      <div style={{
        position: "absolute", bottom: 200, left: 70, right: 70,
      }}>
        {slide.titulo && (
          <p style={{
            color: colorPrimario, fontSize: 42, fontFamily: fuente,
            fontWeight: 900, margin: "0 0 18px 0", textTransform: "uppercase",
            letterSpacing: 3,
          }}>
            {slide.titulo}
          </p>
        )}
        <p style={{
          color: colorTexto, fontSize: 68, fontFamily: fuente,
          fontWeight: 900, margin: 0, lineHeight: 1.2,
          textShadow: "0 3px 20px rgba(0,0,0,0.9)",
        }}>
          {slide.texto}
        </p>
      </div>

      {/* CTA en último slide */}
      {cta && (indice === totalSlides - 1 || totalSlides === 1) && (
        <div style={{
          position: "absolute", bottom: 80, left: 70, right: 70,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{
            background: colorPrimario, borderRadius: 50,
            padding: "22px 60px", alignSelf: "flex-start",
            boxShadow: `0 0 40px ${colorPrimario}60`,
          }}>
            <p style={{
              color: "#000", fontSize: 38, fontFamily: fuente,
              fontWeight: 900, margin: 0,
            }}>
              {cta.texto}
            </p>
          </div>
          {cta.subTexto && (
            <p style={{
              color: "rgba(255,255,255,0.7)", fontSize: 28,
              fontFamily: "Arial, sans-serif", margin: 0, letterSpacing: 1,
            }}>
              {cta.subTexto}
            </p>
          )}
        </div>
      )}

      {/* Swipe hint en slides intermedios */}
      {totalSlides > 1 && indice < totalSlides - 1 && (
        <div style={{
          position: "absolute", bottom: 90, right: 70,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 26, margin: 0 }}>
            Desliza
          </p>
          <p style={{ color: colorPrimario, fontSize: 30, margin: 0 }}>→</p>
        </div>
      )}
    </AbsoluteFill>
  );
};
