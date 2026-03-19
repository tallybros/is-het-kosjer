# Claude Bot Template

A clean, reusable template for deploying an AI chatbot powered by Claude.

## How to use

### 1. Edit `api/config.js` — this is the ONLY file you ever change per bot

| Field | Description |
|---|---|
| `name` | Bot name shown in the header |
| `tagline` | Subtitle shown under the name |
| `avatar` | Base64 image (or leave empty for initials) |
| `starters` | Array of conversation starter chips |
| `prompt` | System prompt — defines the bot's persona and rules |
| `knowledge` | RAG content — CV, FAQ, documents, etc. Never sent to browser |

### 2. Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. **Settings → Environment Variables** → add `ANTHROPIC_API_KEY`
4. Deploy

### 3. For each new bot

- Create a new repo from this template (GitHub → Use this template)
- Edit only `api/config.js`
- Connect to Vercel → add API key → deploy

That's it. `index.html` and `api/chat.js` never need to change.
