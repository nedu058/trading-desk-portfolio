# Trading Desk — Interactive Portfolio

**[Open the public demo](https://chinedu-trading-desk.nedu057.chatgpt.site)**

A public, browser-only engineering demonstration of a research and paper execution workflow. All assets, prices, evidence, and fills are synthetic. Each tab holds a separate in-memory ledger. Reloading resets the simulation.

## Run and review

Node.js 22+; no package dependencies. Run `npm start`, then visit http://127.0.0.1:4321. Run `npm test` to check execution invariants. Alternatively serve dist with any static HTTP server.

1. Inspect ALPHA and the rejected BETA, ORBIT, and NOVA fixtures.
2. Open an ALPHA paper position.
3. Apply Momentum rally to exercise the take-profit rule, or Liquidity selloff to exercise the stop rule.
4. Inspect realized P&L and journal. Export the journal as JSON.
5. Reset; test pausing entries and the missing-evidence scenario.

## Architecture

- `dist/engine.mjs`: pure gates, allocation, fee accounting, and exit decisions. Adapted from the local prototype by replacing Node crypto with browser crypto.
- `dist/scenarios.mjs`: deterministic market fixtures.
- `dist/app.js`: DOM rendering and tab-local state; no backend requests, credentials, wallet, cookies, or persistent visitor storage.
- `dist/index.html` and `dist/style.css`: responsive dashboard plus project case study.
- `preview.mjs`: local static server.

Allocation is capped by available cash, a loss-budget formula, liquidity, and total cost-based exposure. A stop loss may realize more than the planned loss in a gap scenario. Fees are deducted on both entry and exit. Contract checks and social checks are fixture values; the public demo does not claim real verification. This is not a backtest or proof of profitability.

The original local prototype included public-data collectors and a TypeSafe diagnostic connector. Those integrations, local `.env` files, journals, private account data, and live execution are excluded from this public edition.

## Verified behavior

Nine tests cover stale and missing evidence, duplicate entries, exposure limits, paused entries, invalid prices, round-trip fee accounting, scenario eligibility, profit exits, and a selloff that gaps through the configured stop. The local browser flow was verified through entry, rally, automatic exit, and reset.

The $1,000 balance is simulated. Scenario prices are deterministic fixtures, not historical market returns. Refreshing the page starts a new independent session.

## Portfolio description

Built a browser-based paper execution dashboard with evidence gates, bounded allocation, fee-aware ledger accounting, scenario-driven risk exits, and an exportable audit trail. Separated the execution engine from rendering and verified its financial invariants using Node's test runner. Published a static demo with isolated visitor sessions and a technical case study.

## Provenance

Concept inspired by the two user-supplied trading-desk guides by @savipww. Code and portfolio presentation are independently implemented. No performance claims from those guides are used. Sites hosts the demo; source is available as a downloadable archive.
