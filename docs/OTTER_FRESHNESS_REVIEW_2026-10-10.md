# Otter.ai claim freshness candidate — 2026-10-10

- Scope: `otter-ai` only. The production read-only selector found 77 tools, 58 published, 13 due: one `claim_due` (`otter-ai`), five `entity_due`, seven `manual_archive_review`, and zero `schedule_sync`. Otter was selected first. The unrelated classifications are excluded from this batch.
- Production preimage: ID `b8d6a9bd-d9cd-4690-b801-15b1c1fe0a49`; `published`, `monitor`, `freemium`; URL `https://otter.ai/`; next review `2026-10-10`; no `maintenanceReview`. Whole-row SHA-256 excluding `search_vector`: `58dc8fed10838c5361177cc5206c16a28a351724f6d9729e66edc365f87b2697`. Existing detail SHA-256: `d90fffffb03cc8f3eb830bb858ec4cff5fcaf6081bc9c561ca40395fed91f658`.
- The September 10 entity baseline remains valid through December 9. This pass checked only current commercial and usage claims; it did not reopen identity, canonical, media, Decision Graph, or indexing decisions.

## Official source check

Checked October 10, 2026:

- [Otter pricing](https://otter.ai/pricing) still shows standard USD monthly Pro `$16.99` and Business `$30` per user, with annual monthly equivalents `$8.33` and `$19.99`. The same page distinguishes the first-time Business promotion, India-card discount, and education offer from standard prices. It lists Basic 300, Pro 1,200, Business unlimited meeting/in-app minutes with 6,000 imported-file minutes per user per month; the existing per-conversation, import-count, history and concurrency boundaries also remain aligned.
- [Basic-plan limits](https://help.otter.ai/hc/en-us/articles/360047538094-Conversation-import-and-app-limits-on-the-Basic-free-plan) still state 300 monthly minutes, 30 minutes per conversation, three lifetime imports and 25 recent conversations.
- [Monthly-minute reset](https://help.otter.ai/hc/en-us/articles/25205539848343-When-will-my-monthly-minutes-reset) confirms no rollover and a reset tied to the account billing cycle.

Outcome: `reviewed_no_change`. No price, allowance, detail text or `pricingSnapshot` fact is changed. The candidate adds source-backed `features.maintenanceReview` and moves `next_review_date` to `2026-10-24`, the routine 14-day price cadence. Actual checkout, tax, regional offer eligibility and account meter remain conditional.

## Execution boundary

- Authoritative candidate: [preflight](OTTER_FRESHNESS_PREFLIGHT_2026-10-10.json); transaction trial: [rollback](OTTER_FRESHNESS_ROLLBACK_2026-10-10.json); independent readback: [postcheck](OTTER_FRESHNESS_POST_ROLLBACK_2026-10-10.json).
- Preflight, rollback and postcheck each report `productionWrites=0`. The rollback re-read exactly the original preimage. The candidate protects status, page quality, URL, identity, pricing enum and all detail locales.
- No production commit or push was performed. A later owner-reviewed commit must use the exact preflight manifest and pass the fresh preimage and PASS-source checks.
