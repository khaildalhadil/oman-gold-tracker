# متتبع الذهب العماني · Oman Gold Tracker

تطبيق Angular يعرض أسعار الذهب لحظة بلحظة بالريال العماني، مع حاسبة ومحفظة وتنبيهات أسعار.
واجهة عربية (RTL) افتراضياً مع إمكانية التحويل للإنجليزية.

An Angular app that tracks live gold prices in Omani Rial, with a calculator, a personal
portfolio and price alerts. Arabic (RTL) by default, switchable to English.

## المميزات · Features

| | العربية | English |
| --- | --- | --- |
| **الأسعار** | سعر الغرام لعيار 24 و22 و21 و18 بالريال، بالغرام أو التولة أو الأونصة، مع التغيّر خلال 24 ساعة والسعر العالمي بالدولار | Price per karat (24K/22K/21K/18K) in OMR per gram, tola or ounce, 24h change and the USD spot price |
| **سجل الأسعار** | رسم بياني لعيار 24 (24 ساعة / 7 أيام / 30 يوم / الكل) مع الأعلى والأدنى | 24K chart (24h / 7d / 30d / all) with high, low and change |
| **الحاسبة** | قيمة القطعة حسب الوزن والعيار + المصنعية + ضريبة 5% | Value by weight and karat, plus making charges and 5% VAT |
| **محفظتي** | سجّل قطعك الذهبية وشوف قيمتها الحالية والربح/الخسارة | Record your pieces and see current value and profit/loss |
| **التنبيهات** | تنبيه لما سعر الغرام يصير أعلى أو أقل من هدفك (داخل التطبيق + إشعار المتصفح) | Alert when the price per gram crosses a target (in-app toast + browser notification) |

## التشغيل · Getting started

Requires Node.js 20+ and npm.

```bash
npm install
```

```bash
npm start
```

Then open http://localhost:4200.

| Command | What it does |
| --- | --- |
| `npm start` | Dev server with live reload |
| `npm run build` | Production build into `dist/oman-gold-tracker` |
| `npm test` | Unit tests (Vitest) |

## مصدر البيانات · Data and calculations

- **Spot price:** [gold-api.com](https://gold-api.com) (`/price/XAU`), free, no API key, CORS-enabled.
  The app polls it every minute and again whenever the tab becomes visible.
- **OMR conversion:** the Omani Rial is pegged to the US dollar, so prices use
  `1 USD = 0.3845 OMR`.
- **Per gram:** `USD/oz × 0.3845 ÷ 31.1034768 × fineness`, with fineness
  999 (24K), 916 (22K), 875 (21K) and 750 (18K). 1 tola = 11.6638 g.
- **History:** the free API has no history endpoint, so the app records one point every
  5 minutes in `localStorage` while it is open. The chart fills in over time.
- **Storage:** language, unit, history, portfolio and alerts are stored only in the browser
  (`localStorage`, keys prefixed with `omanGoldTracker.`). Nothing is sent to a server.

> الأسعار استرشادية فقط. أسعار محلات الذهب تشمل المصنعية وقد تختلف.
> Prices are indicative only; shop prices include making charges and may differ.

## هيكل المشروع · Project structure

```
src/app/
├── core/
│   ├── gold/        # constants (karats, units, peg) and pure pricing math
│   ├── prices/      # gold-api.com client, live price store, local history
│   ├── portfolio/   # holdings store and valuation
│   ├── alerts/      # price alerts store and notifications
│   ├── i18n/        # Arabic/English translations, formatting pipes
│   ├── storage/     # safe localStorage wrapper
│   └── toasts/      # in-app notifications service
├── shared/
│   ├── line-chart/  # dependency-free SVG chart
│   └── toast-host/  # toast container
└── features/        # lazy-loaded pages
    ├── dashboard/   # prices + history chart
    ├── calculator/
    ├── portfolio/
    └── alerts/
```

Built with Angular 22: standalone components, signals, zoneless change detection,
the new control flow and lazy-loaded routes. No UI or chart libraries.

## الكمتات · Commit convention

Each change is its own commit following [Conventional Commits](https://www.conventionalcommits.org/):
`feat(scope): …`, `fix(scope): …`, `style: …`, `docs: …`, `chore: …`.
