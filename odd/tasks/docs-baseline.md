# Feature: Documentation baseline for Dactyl-ZMK-Config

Branch: `main` | Delivery strategy: ask-on-risk | Test runner: none

## Specs

- S1 Document the project from code: `docs/` sections, feature catalog, OpenSpec baseline specs.
- S2 Respect existing hand-written docs/01..05 and README: do not move or rewrite them.

## Tasks

| ID | Specs | Route | Status | Evidence |
|---|---|---|---|---|
| T1 Detect state + SDD bootstrap | S1 | inline | done | openspec/config.yaml, odd/tasks/docs-baseline.md |
| T2 Ingest prior documentation | S1 | inline | skipped | no prior documents outside docs/01..05 (kept as is, S2) |
| T3 Feature catalog (checkpoint H1) | S1 | inline | done | 16 features F1-F16 confirmed by the user; docs/.manifest.json |
| T4 Technical sections (fan-out) | S1 | delegated (parallel) | done | docs/arquitectura.md, datos.md, configuracion.md, operaciones.md (no api.md: no API) |
| T5 Feature docs + specs (fan-out) | S1 | delegated (parallel) | done | docs/features/*.md (16), openspec/specs/*/spec.md (16, `openspec validate --strict` 16/16) |
| T6 Open questions (fan-in) + index | S1 | inline | done | docs/preguntas-abiertas.md (53 items), docs/README.md, docs/features/README.md, docs/.manifest.json |
| T7 Audit loop (checkpoint H2) | S1 | inline | done | 2 fix rounds; deterministic audit 0 errors, 70 warnings (see Log) |

## Log

- L1 (2026-10-28) "/docs-orchestrator" (document the project; user chose: respect existing hand-written docs/01..05 and README, do not move or rewrite them).
- L2 (2026-10-28) User decisions: 16 ids and slugs confirmed as is; `hardware/third-party` and `work/keymap-explorer.html` left out as assets; 23 keys per half; deep sleep timeout 5 min (config/dactyl.conf, commit 8ac7234); trackball with Logitech M575 undecided.
- L3 (2026-10-28) User later asked to link the project README to the docs and to refresh its status and layout (commits fca6ac2, c6ed83b); this supersedes the "do not rewrite README" part of S2 for the root README only.
- L4 (2026-10-28) Audit result: 0 errors. Warnings left: 53 `CITATION_PATH` for `.github/workflows/build.yml` are an audit-script false positive (it strips the leading dot); 17 `STALE` because the root README.md changed after documented_commit 8ac7234, so every `README.md:<line>` citation refers to that commit (`git show 8ac7234:README.md`).

