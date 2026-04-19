import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const ImagenEscena = ({ imagen }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const escala = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  const opacidad = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      <Img
        src={imagen}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${escala})`,
          filter: "brightness(0.45)",
        }}
      />
    </AbsoluteFill>
  );
};
