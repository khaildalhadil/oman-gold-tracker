# متتبع الذهب العماني · Oman Gold Tracker

تطبيق Angular يعرض أسعار الذهب بالريال العماني، مع حاسبة ومحفظة وتنبيهات أسعار.
الأسعار تأتي من **Gold Price Tracker API** مبني بـ ASP.NET Core Web API (مجلد `backend/`).
واجهة عربية (RTL) افتراضياً مع إمكانية التحويل للإنجليزية.

An Angular app that shows gold prices in Omani Rial, with a calculator, a personal
portfolio and price alerts. Prices come from the **Gold Price Tracker API**, an
ASP.NET Core Web API in `backend/`. Arabic (RTL) by default, switchable to English.

## المميزات · Features

| | العربية | English |
| --- | --- | --- |
| **الأسعار** | سعر الغرام لعيار 24 و22 و21 و18 بالريال، بالغرام أو التولة أو الأونصة، مع التغيّر خلال 24 ساعة وسعر الأونصة بالدولار | Price per karat (24K/22K/21K/18K) in OMR per gram, tola or ounce, 24h change and the price per ounce in USD |
| **سجل الأسعار** | رسم بياني لعيار 24 (24 ساعة / 7 أيام / 30 يوم / الكل) مع الأعلى والأدنى | 24K chart (24h / 7d / 30d / all) with high, low and change |
| **الحاسبة** | قيمة القطعة حسب الوزن والعيار + المصنعية + ضريبة 5% | Value by weight and karat, plus making charges and 5% VAT |
| **محفظتي** | سجّل قطعك الذهبية وشوف قيمتها الحالية والربح/الخسارة | Record your pieces and see current value and profit/loss |
| **التنبيهات** | تنبيه لما سعر الغرام يصير أعلى أو أقل من هدفك (داخل التطبيق + إشعار المتصفح) | Alert when the price per gram crosses a target (in-app toast + browser notification) |

## التشغيل · Getting started

شغّل الـ API أولاً ثم واجهة Angular، كل واحد في نافذة Terminal منفصلة.
Start the API first, then the Angular app, each in its own terminal.

### 1. الـ API · Backend (ASP.NET Core)

Requires the [.NET 10 SDK](https://dotnet.microsoft.com/download).

```bash
cd backend/GoldPriceTracker.Api
```

```bash
dotnet run
```

The API listens on http://localhost:5286 and Swagger UI opens at
http://localhost:5286/swagger to try every endpoint.

### 2. الواجهة · Frontend (Angular)

Requires Node.js 20+ and npm.

```bash
npm install
```

```bash
npm start
```

Then open http://localhost:4200. The prices on every page are loaded from the API; if it is
not running, the dashboard shows an error with a retry button.

| Command | What it does |
| --- | --- |
| `npm start` | Dev server with live reload |
| `npm run build` | Production build into `dist/oman-gold-tracker` |
| `npm test` | Unit tests (Vitest) |

## الـ API · Endpoints

| Method | Endpoint | الوصف · Description | Responses |
| --- | --- | --- | --- |
| `GET` | `/api/goldprices` | أسعار جميع العيارات · All karats | `200 OK` |
| `GET` | `/api/goldprices/{karat}` | سعر عيار محدد (Endpoint مخصص) · One karat, e.g. `/api/goldprices/22` | `200 OK`, `404 Not Found` |
| `GET` | `/api/goldprices?karat=21` | سعر عيار محدد (Query Parameter) · Filter by karat | `200 OK`, `404 Not Found` |

Example response for `GET /api/goldprices/22`:

```json
{ "karat": 22, "pricePerGram": 46.720, "currency": "OMR", "updatedAt": "2026-10-19T14:19:05Z" }
```

An unknown karat (e.g. `/api/goldprices/14`) returns `404` with
`{ "message": "No price for karat 14. Available: 24, 22, 21, 18." }`.

```
backend/GoldPriceTracker.Api/
├── Controllers/GoldPricesController.cs  # the endpoints above
├── Models/GoldPrice.cs                  # Karat, PricePerGram, Currency, UpdatedAt
├── Services/GoldPriceService.cs         # in-memory price list (no database)
└── Program.cs                           # controllers, Swagger, CORS for localhost:4200
```

## مصدر البيانات · Data and calculations

- **Prices:** sample prices per gram in OMR, kept in a list inside the API (no database, no
  live market feed). The Angular app (`src/app/core/prices/gold-api.ts`) calls
  `GET /api/goldprices` every minute and again whenever the tab becomes visible. To point it
  at another server, change `API_BASE_URL` in that file.
- **Units:** tola and ounce prices are the per-gram price × 11.6638 g or × 31.1035 g.
- **USD:** the Omani Rial is pegged to the US dollar, so the ounce price in USD uses
  `1 USD = 0.3845 OMR`.
- **History:** the API has no history endpoint, so the app records one 24K point every
  5 minutes in `localStorage` while it is open. The chart fills in over time.
- **Storage:** language, unit, history, portfolio and alerts are stored only in the browser
  (`localStorage`, keys prefixed with `omanGoldTracker.`). The app only reads prices from the
  API; nothing is sent to it.

> الأسعار استرشادية فقط. أسعار محلات الذهب تشمل المصنعية وقد تختلف.
> Prices are indicative only; shop prices include making charges and may differ.

## هيكل المشروع · Project structure

```
src/app/
├── core/
│   ├── gold/        # constants (karats, units, peg) and pure pricing math
│   ├── prices/      # API client, price store, local history
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
The backend is ASP.NET Core 10 Web API with controllers and Swashbuckle (Swagger).

## الكمتات · Commit convention

Each change is its own commit following [Conventional Commits](https://www.conventionalcommits.org/):
`feat(scope): …`, `fix(scope): …`, `style: …`, `docs: …`, `chore: …`.
