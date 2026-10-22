# Tokyo Paper Market / 鲸鱼娘日股模拟器

An original, MIT-licensed single-player HTML game from the DeepSeek-chan community. Four fictional Japanese-themed companies, 30 days, virtual yen, spot trading, simplified long/short positions and loans. No accounts, dependencies, network requests, API keys or real money. This is a game, not a reproduction of JPX rules or real market prices.

## Play

Unzip and open `index.html` in a modern browser. Everything runs locally. For hosting, upload these files to any static web host. If browser restrictions prevent saving under `file://`, export a save manually or use a static host. On iPhone use a hosted page; real iPhone/Safari file handling has not yet been tested.

## Saves

This standalone export uses `tokyo-paper-market-v1` in localStorage. Export creates a portable JSON file; import validates format and fields and asks before replacing progress. Site and standalone saves are separate browser storage locations. The site and standalone share the `tideplay-save` version 1 JSON format for this game. Only compatible Tokyo game JSON can be imported; site library backups and compressed save codes are not accepted by this standalone runner. Keep exported backups: browsers may clear local storage.

## Rules

- ¥1,000,000 initial cash; four invented companies; 100-share spot lots.
- Orders charge 0.1%, rounded up to ¥1. Closing leveraged positions charges against fixed entry notional, capped at available collateral.
- Up to 8 isolated positions, 1–3× leverage. Close at or below 25% collateral. A position cannot lose more than its posted margin; separate debt is still owed.
- Borrowing cannot bring outstanding debt above ¥500,000. Each advanced day adds 0.1% interest to debt, rounded up. Interest can subsequently push debt over the borrowing cap.
- Prices move only on “Next trading day”, using a seeded local pseudo-random generator. Day 30 closes all holdings; remaining debt stays on the account. You may repay after settlement.
- No API, real quotes, wallet, deposits, payouts, leaderboards or paid features.

## Modules

- `tokyo-market.js`: pure, deterministic rules, validation and accounting. CommonJS export available for Node tests.
- `tokyo-ui.js`, `tokyo.css`: bilingual responsive game view.
- `standalone.js`: local persistence and portable save import/export.

This is an export from the existing DeepSeek-chan site project, not a replacement site. The site renderer has a character portrait; this export replaces it with a Unicode whale. **MIT covers only the original code in this package.** No original Bilibili game source, third-party art, DeepSeek logo or character rights are included. The project is unofficial and not affiliated with DeepSeek or a stock exchange.

代码按 MIT 开放，允许修改和商业使用，并保留许可证与版权说明。角色图片及品牌权利不随代码授权。所有股票、资金和行情均为虚构；解压打开 index.html 即可玩。
