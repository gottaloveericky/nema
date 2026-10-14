# NEMA, notes for Claude Code

NEMA stands for Nematode-Encoded Modulation Array. A 302 neuron network on the real *C. elegans* wiring diagram, a long scroll site, and a steering layer for local language models. It is a fork of WERM (https://github.com/Henryfud/werm, MIT). Keep the original copyright line in `LICENSE`.

`HANDOFF.md` is the original WERM handoff. `AUDIT.md` records what was checked and changed after it, and `docs/RESULTS.md` holds what has been measured. Read those before changing the model.

## Commands

```bash
npm test                  # unit tests, all must pass
npm run check             # prose rule and data profile
npm run build:site        # rebuilds site/index.html and site/artifact.html
npm run sweep             # parameter sweep, docs/results/sweep.csv
npm run experiments       # null models and reservoir benchmark, docs/results/
node src/cli.mjs sim --stim touch-tail --seconds 3
node src/cli.mjs connect --model llama3.2  # needs Ollama, or --base-url for any OpenAI style server
bash scripts/fetch_genome.sh               # needs internet, about 100 MB
```

## Rules

- No em dashes and no double hyphens in prose. Plain, human sounding sentences.
- The fork removed the upstream token contract address bar (2026-10-13). Do not add wallet, trading, price or other financial features unless the owner asks.
- Links on the page come from `GITHUB_URL`, `SITE_URL` and `X_URL` at build time. Do not hard code them in the template.
- Never invent a number, a sequence, an edge or a citation. Every figure traces to `docs/research/`.
- Citations marked "recall" in `docs/research/07-reading-list.md` must be verified before they appear in public copy.
- Do not push or create a repository without the user saying yes.
- Ask the user decisions as short multiple choice questions with a recommended first option.
- Keep the honest limits in the README and the notes. State them once, plainly.
- Do not copy Sorocarp (sorolabs.si). It was an example of the kind of project, not a template.
- `site/index.html` and `site/artifact.html` are generated. Edit `site/template.html` and rebuild.
- The source of truth for the model is `src/network.mjs`. The site inlines it at build time.
- If you change the model, rerun `npm run sweep` and `npm run experiments`, update `docs/RESULTS.md`, and update the snapshot test with a reason in the commit.
