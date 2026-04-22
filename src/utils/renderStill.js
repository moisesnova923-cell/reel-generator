import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTRY_POINT = path.resolve(__dirname, "../remotion/index.jsx");
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

let cachedBundle = null;

async function getBundle() {
  if (cachedBundle) return cachedBundle;
  const opts = { entryPoint: ENTRY_POINT };
  if (fs.existsSync(PUBLIC_DIR)) opts.publicDir = PUBLIC_DIR;
  cachedBundle = await bundle(opts);
  return cachedBundle;
}

export async function renderSlide(props, outputPath) {
  const bundleLocation = await getBundle();

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "PostSlide",
    inputProps: props,
  });

  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: outputPath,
    inputProps: props,
    imageFormat: "png",
    chromiumOptions: { disableWebSecurity: true },
  });

  return outputPath;
}
