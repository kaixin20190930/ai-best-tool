# Catalog & Index Recovery Audit — 2026-10-22

This is one combined recovery batch. It completed one generic Catalog publication and one two-tool index release without creating tool-specific release code.

## Catalog candidate: Kling AI

- Prepared the generic `collection_candidates -> draft -> published + monitor/noindex` selection for the consumer Kling AI creative app at `https://kling.ai/`; Kling API, model names and resellers are excluded as separate entities.
- Added Kuaishou Technology's official investor-relations announcement for Kling 4.0 and linked it to the identity/product-boundary and `brand_affiliation` claims. The source supports the public relationship between Kuaishou and Kling AI models; it is not used to assert the legal operator of every service or API route. See [Kuaishou official announcement](https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-officially-launches-next-generation-kling-40-raising).
- Read-only duplicate check on 2026-10-22 found no matching production Tool or `collection_candidates` rows for the submitted Kling name/host variants. Generic enqueue must repeat its exact production preflight.
- The record has EN/CN/TW detail, Best for / Not ideal for, comparison axes (Pika and Runway), Task Cluster role `anchor`, Tool Intelligence downstream destination, official sources, and claim-level review dates.
- Pricing, credit/model access, region and watermark are conditional. Commercial-use terms have a documented source-scope conflict; the selection makes no blanket commercial-rights promise. Account checkout, regional eligibility and generation quality were not tested.
- Created a neutral, platform-owned abstract SVG. It contains no vendor UI, logo or trademark artwork; its SHA-256 is embedded in the selection JSON.
- Production result: candidate `faac3f69-8d83-4ae7-91b2-0aeb32f16119` was enqueued, imported to Tool `8396b409-05e0-4c2c-97e4-bcf4a18db40f`, and published as `published + monitor/noindex`. Candidate and Tool rollback rehearsals passed; both postchecks returned `productionWrites=0`. No Task Fit, Task Page, index or sitemap approval was created for Kling AI.

## Existing-tool index evidence batch: Replit and Otter AI

Executable manifest: `docs/INDEX_FAST_TRACK_REPLIT_OTTER_2026-10-22.json`. It preserves the exact two read-only production `updated_at` and `md5(features::text)` preimages; item content and source references are unchanged from the prior prepared manifest:

| Tool | ID | Production updated_at | features MD5 | Existing next review |
|---|---|---|---|---|
| Replit | `b14c8fe0-3dc5-47ed-8dd8-9d16c9892f85` | `2026-10-09 14:29:49.311992+00` | `f61706420b7d8b0e43041e68404c9ece` | 2026-10-23 |
| Otter AI | `b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49` | `2026-10-10 01:46:59.601287+00` | `af0fbc82ea12db523b1eb222ec9ab8a2` | 2026-10-24 |

Each executable item carries official sources, two distinct independent decision/durability signals, localized Best fit / Not ideal / comparison axes / limitations, explicit official identity, exact-scope duplicate preimage, and mature-brand `fastTrackEligibility`. Independent sources are signals only, not authoritative product facts. The editorial score is a readiness threshold, not measured search volume, rankings or traffic. Existing next-review dates are unchanged.

The QA-clean executable scope is deliberately limited to Replit and Otter AI. The normalized manifest SHA-256 is `cf34835a2aecfb3feae6d4185803aa3d3f09fc88f409cfeeb6c1d3c633363d5f`.

**Deferred, non-executable candidates:** Cursor, Runway and Gamma are removed from the executable manifest and have no QA PASS in this batch. Their prior independent sources were rejected by the independent QA gate and are recorded here only for traceability; they must not be reused as passed evidence:

| Deferred tool | Rejected independent sources | Status |
|---|---|---|
| Cursor | `https://tech.co/ai/vibe-coding/cursor-review-features-pricing-more`; `https://computertech.co/cursor-review/` | Deferred; no PASS; not in executable manifest |
| Runway | `https://www.fast.io/resources/runway-ai-review-2026/`; `https://www.firmcritics.com/review/runway-ai/` | Deferred; no PASS; not in executable manifest |
| Gamma | `https://24slides.com/presentbetter/gamma-app-review`; `https://writetested.com/blog/gamma-review-2026` | Deferred; no PASS; not in executable manifest |

No reason beyond the QA rejection is inferred here. Replacing these sources is intentionally out of scope for this bounded rework.

### Generic write-path blocker

The shared writer permits `decision` only as an exact two-key object (`compareAxes`, `limitations`), each containing non-empty arrays for exactly `en`, `cn`, `zh` and `tw`; malformed locales, empty arrays and extra decision keys are rejected. The merge preserves any pre-existing decision fields. No tool-specific branch was introduced. Existing `next_review_date` values for Replit and Otter AI were not changed; both are on or after 2026-10-22, satisfying the selector's as-of-date check. No other A-grade gate was loosened.

Cursor's previously recorded provider-compatibility caveat remains only historical context for its deferred item; it is not an approval or a blocker being evaluated in this executable batch.

## Verification and boundaries

- Production reads only: exact Replit/Otter Tool preimages, duplicate scope, related published Task Fits, evidence preflight/rollback, and index selector.
- Scoped test: `pnpm exec tsx scripts/test-index-fast-track-evidence.ts` passed, including acceptance of the localized decision patch, preservation of existing decision fields, and rejection of missing, empty, extra-key and extra-locale decision data.
- TypeScript and the scoped index evidence test passed after the generic decision-patch validation change. Kling selection JSON, the two-item manifest and SVG XML validation passed.
- Generic evidence preflight and rollback covered exactly Replit and Otter AI; both returned `productionWrites=0`. Manifest SHA-256: `cf34835a2aecfb3feae6d4185803aa3d3f09fc88f409cfeeb6c1d3c633363d5f`.
- Final selector reviewed exactly 2 items using GSC through 2026-10-14 and site health `warning`: **eligible: Otter AI and Replit; blocked: none; productionWrites: 0**. Both are `mature_high_demand`. Final selector batch hash: `be82bcb3c724cf5333fc5a6e5f23d042a7147e8d301a07363286804965539f4c`.
- Existing next-review dates were read but not written. Kling JSON/media validation is repeated for this rework; the official Kuaishou announcement is attached only to the stated identity/brand-affiliation claim.
- Production evidence commit changed exactly Replit and Otter AI; its postcheck returned both `alreadyApplied=true` and `productionWrites=0`. Index rollback passed, index commit changed exactly those two rows, and the final postcheck passed. Daily quota is now 2/5 and weekly quota 10/25.
- Production now reports 112 Tool IDs: `draft/monitor=9`, `pending/monitor=12`, `published/archive=2`, `published/continue_index=28`, `published/monitor=50`, `rejected/monitor=11`. Published total is 80.
- Production sitemap contains 148 URLs, including EN/CN Replit and Otter AI entries. Their public pages are 200, self-canonical, and have no robots noindex directive. Kling AI EN/CN pages are 200, self-canonical and remain `noindex, follow`; Kling has zero sitemap entries.
- `git diff --check`, the scoped test and TypeScript passed. No full build was run because no route, rendering component, build configuration or publication path changed.
