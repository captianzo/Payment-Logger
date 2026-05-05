# Payment Logger

A Telegram bot that pulls structured data from UPI payment screenshots using Gemini Vision and logs the transactions directly into a Google Sheet.

---

## How It Works

Send a payment screenshot and the payee's name to the bot. You can send them in any order; the bot uses in-memory session storage to hold the data until it has both pieces, then it writes the record.

The bot uses `gemini-3.1-flash-lite-preview` to extract the following fields from the image:

- Amount
- Date
- Time
- UPI Transaction ID
- Payment Source

---

## Project Structure

```
Payment-Logger/
├── src/
│   ├── extractor.js    # Gemini Vision prompt and response parsing[cite: 1]
│   ├── server.js       # Webhook handler and session logic[cite: 1]
│   ├── sheets.js       # Google Sheets append[cite: 1]
│   └── telegram.js     # Image download from Telegram CDN[cite: 1]
└── README.md           # Main project documentation[cite: 1]
```

`server.js` is the entry point. It handles incoming Telegram webhook events, manages sessions per chat, and calls the other three modules.

`extractor.js` encodes the image as base64 and sends it to Gemini with a strict prompt - the model returns only a JSON object with the extracted fields, nothing else. Edge cases like 12-to-24hr time conversion and missing years in dates are handled in the prompt.

`sheets.js` appends a row to the `PaymentLogs` tab using a Google service account.

`telegram.js` resolves a Telegram `file_id` to a download URL and returns the image as a Node.js Buffer.

---

## Setup

### 1. Prerequisites

- Node.js 18+
- Telegram Bot token (from @BotFather)
- Google Cloud project with Sheets API enabled and a service account
- Gemini API key
- A public HTTPS URL for your webhook (ngrok works for local dev)

### 2. Google Sheet Configuration

Create a Google Sheet and add a tab named `PaymentLogs`. Set up your columns in this exact order:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Payee Name | Amount | Date | Time | UPI Transaction ID | Source |

Share the sheet with your service account email and give it Editor access.

### 3. Installation

```bash
git clone https://github.com/captianzo/Payment-Logger.git
cd Payment-Logger
npm install
```

### 4. Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GEMINI_API_KEY=your_gemini_api_key
SPREADSHEET_ID=your_google_sheet_id
```

For Google Sheets auth, set up Application Default Credentials by pointing to your service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

### 5. Running the Bot

Register your webhook with Telegram:

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://yourdomain.com/webhook/<YOUR_TOKEN>"
```

Then start the server:

```bash
npm start
```

---

## Technical Notes & Limitations

- **Stack:** Node.js and Express.js v5. Images are downloaded via Axios from Telegram's CDN.
- **Sessions:** Stored in-memory, keyed by `chatId`. Pending name/screenshot pairs are lost on server restart.
- **Current limitations:** No support for PDF receipts or batching multiple images per transaction. No built-in command to query past logs from within the bot.
