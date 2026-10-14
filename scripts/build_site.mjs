// Inlines the data and the simulation code into site/template.html.
// Writes site/index.html (full page) and site/artifact.html (fragment for hosts that wrap the page themselves).
//   GITHUB_URL  repo link on the page   (on Vercel, defaults to the GitHub repo the project is connected to)
//   SITE_URL    where the page is hosted, used for link previews (on Vercel, defaults to the production domain)
//   X_URL       the project's X account (the X links are left out when this is not set)
import fs from "node:fs";
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const strip = (src) => src.replace(/^import .*$/gm, "").replace(/^export (default )?/gm, "");
// Vercel sets these during builds. The production URL comes without a scheme, and the repo vars only exist for Git deployments.
const env = process.env;
const vercelRepo = env.VERCEL_GIT_PROVIDER === "github" && env.VERCEL_GIT_REPO_OWNER && env.VERCEL_GIT_REPO_SLUG ? `https://github.com/${env.VERCEL_GIT_REPO_OWNER}/${env.VERCEL_GIT_REPO_SLUG}` : "";
const vercelSite = env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
const gh = (env.GITHUB_URL || vercelRepo || "https://github.com/gottaloveericky/nema").replace(/\/$/, "");
const site = (env.SITE_URL || vercelSite || "").replace(/\/$/, "");
const x = env.X_URL || "";
if (!site) console.warn("SITE_URL is not set, link previews use relative image paths.");

const json = (p) => JSON.stringify(JSON.parse(read(p)));
const logo = "data:image/png;base64," + fs.readFileSync(new URL("site/assets/logo.png", root)).toString("base64");
// the page only needs the summary of the null model experiment, not every row. null until it has been run.
const nullFile = new URL("docs/results/null-models.json", root);
const nullModels = fs.existsSync(nullFile) ? JSON.parse(fs.readFileSync(nullFile, "utf8")) : null;
const results = nullModels ? JSON.stringify({ generated: nullModels.generated, graphsPerKind: nullModels.graphsPerKind, summary: nullModels.summary }) : "null";

const code = ["src/network.mjs", "src/steer.mjs", "src/graphs.mjs"].map((p) => strip(read(p))).join("\n");
const data = [
  `const CONNECTOME = ${json("data/connectome.json")};`,
  `const GC_WINDOWS = ${json("data/gc_windows.json")};`,
  `const GENE_WINDOWS = ${json("data/gene_windows.json")};`,
  `const NULL_RESULTS = ${results};`,
].join("\n");

let html = read("site/template.html")
  .replace("/*__DATA__*/", () => data)
  .replace("/*__NETWORK__*/", () => code)
  .replaceAll("__GITHUB_URL__", gh)
  .replaceAll("__SITE_URL__", site)
  .replaceAll("__X_URL__", x)
  .replaceAll("__LOGO__", logo);

const left = html.match(/__[A-Z_]+__|\/\*__[A-Z]+__\*\//g);
if (left) { console.error("unreplaced placeholders:", [...new Set(left)].join(", ")); process.exit(1); }

fs.writeFileSync(new URL("site/artifact.html", root), html);
const title = "NEMA, a 302 neuron worm brain in your browser";
const desc = "A 302 neuron network built on the real wiring diagram of C. elegans, running in your browser, with its genome drawn to scale and a small layer that steers a local language model.";
const img = site ? `${site}/assets/logo.png` : "assets/logo.png";
const handle = (x.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)/) || [])[1];
const head = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${desc}">
<meta name="theme-color" content="#03050f">
${site ? `<link rel="canonical" href="${site}/">\n` : ""}<link rel="icon" type="image/png" href="${logo}">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="NEMA">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
${site ? `<meta property="og:url" content="${site}/">\n` : ""}<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="The NEMA mark, a dithered wave of teal, coral and gold">
<meta name="twitter:card" content="summary">
${handle ? `<meta name="twitter:site" content="@${handle}">\n` : ""}<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">
<style>html,body{margin:0}</style></head><body>
`;
const full = head + html + "\n</body></html>\n";
fs.writeFileSync(new URL("site/index.html", root), full);
console.log("built site/index.html", (full.length / 1024).toFixed(0) + " KB");
