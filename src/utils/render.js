import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY_POINT = path.resolve(__dirname, "../remotion/index.jsx");
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

function copiarDirectorio(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copiarDirectorio(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export async function renderizarReel(props, outputPath, onProgress) {
  const bundleLocation = await bundle({
    entryPoint: ENTRY_POINT,
    publicDir: PUBLIC_DIR,
  });

  // Copiar assets al bundle para garantizar que el servidor los encuentre
  console.log("   Copiando assets al bundle...");
  copiarDirectorio(PUBLIC_DIR, bundleLocation);

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
