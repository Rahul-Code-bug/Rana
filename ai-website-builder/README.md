# AI Website Builder Pro

A beginner-friendly local AI website builder. It creates a **multi-page website project**, lets you preview individual pages, and downloads all generated files as a ZIP. It uses Gemini through a server-side API key (the key is never sent to the browser).

## Features

- Generate a website with Home, About, Services/Features, Contact, and other relevant pages.
- Multi-page preview selector.
- Responsive layouts and shared CSS/JavaScript files.
- Download the whole website project as a ZIP.
- Download a single HTML page for quick testing.
- Demo mode if no API key is configured.
- API request timeout and clear error messages.
- A `/api/health` endpoint for troubleshooting.

## Requirements

- Node.js 20 or newer (LTS recommended)
- Internet connection for Gemini AI generation
- A Gemini API key from Google AI Studio for AI generation

## Install on Windows

1. Extract this ZIP to a folder, for example `C:\ai-website-builder-pro`.
2. Install Node.js LTS from https://nodejs.org/ if it is not already installed.
3. Open the extracted folder.
4. Copy `.env.example` and rename the copy to `.env`.
5. Open `.env` in Notepad and replace `PASTE_YOUR_NEW_API_KEY_HERE` with your Gemini API key. Do not share the key or upload `.env`.
6. Open Command Prompt in this folder (click the folder address bar, type `cmd`, and press Enter).
7. Run:

   ```bash
   npm install
   npm run dev
   ```

8. Open http://localhost:3000 in your browser.

## How to use

1. Describe the website in the prompt box. Example:

   > Build a professional website for a local plumbing company in Patna. Include Home, About, Services, Service Areas, FAQs, and Contact pages. Use a navy and teal design, responsive navigation, service cards, testimonials clearly marked as sample content, a working mobile menu, FAQ accordions, and a contact form with front-end validation. Do not claim the form sends messages unless a backend is implemented.

2. Click **Generate full website**. The first request can take a little time; wait for the status or error message.
3. Use the page selector to preview different pages.
4. Click **Download website ZIP** to save the complete project.
5. Extract the downloaded ZIP and open `index.html` to test it. For best results, serve the files locally or deploy them to a static host.

## Troubleshooting

- **Server check:** visit http://localhost:3000/api/health. It should show `{"ok":true}`.
- **Loading forever:** check the terminal window for the error. This version aborts the Gemini request after 90 seconds and displays a helpful message.
- **401 / API key error:** create a new key in Google AI Studio and update `.env`.
- **404 / model error:** verify `GEMINI_MODEL` is a model available to your API key.
- **429 / quota error:** check your Gemini API quota and billing/limits.
- **Demo mode:** if no API key is configured, the app returns a demo project. Add the key to `.env` and restart the server.
- **Changes to `.env`:** stop the server with `Ctrl+C`, then run `npm run dev` again.
- Never paste your API key into chat or browser code.

## Important limitations

This creates a front-end website project, not a full hosted SaaS platform. Forms are front-end demos unless you connect a backend/email service. Login, payment processing, databases, admin dashboards, and production integrations require separate secure services and configuration. AI-generated code should be reviewed before production use.

## Project structure

```text
ai-website-builder-pro/
├── server.js
├── package.json
├── .env.example
├── README.md
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```
