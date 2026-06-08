# AZALAI

AZALAI is a private single-user creative release system. It treats ideas like stock moving through a backroom, dispatch desk, judgement hall, departure gate, trade ledger, or storage shelf.

The goal is to prevent creative work from staying almost finished. Every task is guided toward one of three outcomes: Ship, Ask for Feedback, or Storage.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Public Demo

This deployment is a public demo of the AZALAI prototype. It does not use authentication, a backend database, payments, or shared accounts.

Data is stored locally in each user's browser with `localStorage`, so each visitor sees and manages their own browser-local demo data. Clearing browser storage, changing browsers, or using another device may remove or hide that local demo data.

## Board Stations

- Inbox: raw ideas and unprocessed tasks.
- Clarification Station: define what the task actually is.
- Scope Market: manage the release to-do list, with AZALAI-generated scope items plus manual editing, adding, checking off, and removing.
- Construction: build the draft, asset, post, page, prototype, or deliverable.
- Judgement Hall: run the release decision.
- Feedback Booth: generate and store targeted questions or external comments.
- Departure Gate: final pre-shipping check.
- Trade Ledger: shipped proof and evidence record.
- Storage: stored ideas and backstock.

## Inbox Intake

Inbox supports messy capture before something becomes a structured task:

- Text input works fully.
- Link input stores the URL and notes.
- Plain text file uploads are read into the raw card.
- PDF uploads are attached with a placeholder for future extraction.
- Image uploads attach a preview and show the placeholder: `Image text reading will be added later.`
- Voice intake supports microphone STT when the browser exposes speech recognition, plus audio upload fallback. If STT is not available, the app shows a placeholder and lets you type or upload audio.

Raw Inbox cards are different from normal task cards. They stay in Inbox until the user clicks `Clarify with AZALAI`, reviews the editable `Clarification Draft`, and chooses `Accept Clarification`.

Accepting a draft converts the raw item into a full AZALAI task in `Clarification Station`. The original input remains attached under `Original Stock`, and the read-only AI summary remains attached under `AZALAI Stock Read`.

Rejecting a draft keeps the raw item in Inbox so it can be clarified again later.

AZALAI also checks timing in intake. If the raw stock includes a date, it fills the task due date. If no date is detected, it suggests an editable due date from current workload and risk. The dispatch slip includes a suggested `Ship goal` based on other active tasks, risk, and estimated effort; the user can change it.

## Decision Engine

The app uses a simple rule-based engine in `src/lib/decisionEngine.ts`.

It reads risk level, confidence score, and minimum shippable version. It recommends Ship, Ask for Feedback, or Storage, then explains why. Confidence is only edited in judgement contexts such as Judgement Hall.

AI does not make final taste decisions. The recommendation is a release-assistant signal; the human keeps final judgement over taste, visual direction, emotional tone, cultural fit, and whether the work feels right.

## Mocked AI

The Ask AZALAI panel calls `askAzalai(task, mode)` in `src/lib/aiClient.ts`. Version one returns useful mock responses for:

- Clarify Goal
- Define Minimum Shippable Version
- Check Scope Creep
- Run Release Check
- Generate Feedback Questions
- Summarise Shipped Evidence

Inbox clarification uses `clarifyInboxItem(rawItem)` in `src/lib/aiClient.ts`. Version one returns mock structured JSON shaped for the editable Clarification Draft.

## Connecting Real OpenAI Calls Safely

Do not put OpenAI API keys in frontend code. Browser code is public to the user and can leak secrets.

Add a small backend or serverless route that:

1. Receives `{ task, mode }` from the browser.
2. Adds the AZALAI system instruction from `src/lib/aiClient.ts`.
3. Calls the OpenAI API with a server-side API key.
4. Returns only the assistant response to the frontend.

Then replace the mock body of `askAzalai(task, mode)` with a `fetch` call to that protected route.

For Inbox Intake, replace `clarifyInboxItem(rawItem)` with a protected backend call that can send raw text, extracted file text, OCR text, transcript text, or link notes to the model and request structured JSON. OCR, PDF parsing, transcription, and link analysis should all happen server-side or in explicit local processors, not by exposing private API keys in browser code.

## Not Building Yet

Keep the prototype lightweight for now. Do not add login, teams, payments, marketplace features, full SaaS onboarding, complex analytics, or a backend database until the release workflow is proven useful.
