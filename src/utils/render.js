import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY_POINT = path.resolve(__dirname, "../remotion/index.jsx");
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

export async function renderizarReel(props, outputPath, onProgress) {
  // publicDir es opcional — solo se pasa si existe la carpeta
  const bundleOpts = { entryPoint: ENTRY_POINT };
  if (fs.existsSync(PUBLIC_DIR)) bundleOpts.publicDir = PUBLIC_DIR;

  const bundleLocation = await bundle(bundleOpts);

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ReelInstagram",
    inputProps: props,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: props,
    imageFormat: "jpeg",
    chromiumOptions: { disableWebSecurity: true },
    onProgress: ({ progress }) => {
      process.stdout.write(`\r   Renderizando: ${Math.round(progress * 100)}%`);
      if (onProgress) onProgress(progress);
    },
  });

  console.log("\n");
  return outputPath;
}
