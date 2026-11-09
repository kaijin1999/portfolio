import { readFile, unlink, writeFile } from "node:fs/promises";

const built = new URL("../landing-build/landing.html", import.meta.url);
const html = await readFile(built, "utf8");
// GitHub Pages serves the repository root. Keep bundled files in their own directory.
await writeFile(new URL("../index.html", import.meta.url),
  html.replaceAll("./static/", "./landing-build/static/"));
await unlink(built);
