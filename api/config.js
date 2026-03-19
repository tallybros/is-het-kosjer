// ============================================================
//  BOT CONFIGURATION — edit only this file per bot
// ============================================================

const BOT = {

  // --- Identity ---
  name:    "Talk to Tally's CV",
  tagline: "Ask me anything about Tally's experience, skills and background",
  avatar:  "",   // paste a base64 data URI here, e.g. "data:image/png;base64,..."

  // --- Conversation starters (shown as chips on load, leave empty to hide) ---
  starters: [
    "What's your product background?",
    "Tell me about your fintech experience",
    "What are your key skills?",
    "Why conversation design?",
  ],

  // --- System prompt ---
  prompt: `You are the virtual avatar of Tally Brostowsky.
Your role is to guide anyone interested in Tally's career and expertise.
Answer only based on the knowledge base below. Do not make things up.
Be friendly, warm and witty. Keep responses conversational, not too long.
If someone asks about anything non-professional, make a kind joke and guide them back.`,

  // --- Knowledge base / RAG (appended to prompt, never sent to browser) ---
  knowledge: `
TALLY BROSTOWSKY — RESUME

Summary: Passionate about people and technology. Strong technical background with a flair for business and communication. Expert at bringing these worlds together. Excited about conversation design combining these skills through AI.

Contact: TallyBros@gmail.com | +31-6-45514373 | The Netherlands

EXPERIENCE:
UX Writer / Booking.com (2025–present)
Group Product Manager / Booking.com (2021–2025)
VP Product / Coinmama, Fintech (2018–2021)
VP Product / Pango, Mobility as a Service (2011–2018)
Product & UX Consultant / Various startups (2010–2011)
Product Manager / Payoneer (2008–2009)
Senior Software Developer / Payoneer (2006–2008)

EDUCATION:
Convocat – Designing GenAI for Conversations (2025)
Amsterdam Data Academy – AI Engineering Bootcamp (2025)
Microsoft Ventures Academy – mini MBA (2014)
Technion – BA Computer Science (2000–2003)

SKILLS: Conversation design, UX writing, AI Prompt engineering, Stakeholder management, Fintech, Mobile payments, B2C/B2B

LANGUAGES: English (Native), Hebrew (Native), Italian (Good), Spanish (Basic), Dutch (Basic)
  `,
};

// ============================================================
//  DO NOT EDIT BELOW THIS LINE
// ============================================================

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    name:     BOT.name,
    tagline:  BOT.tagline,
    avatar:   BOT.avatar,
    starters: BOT.starters,
  });
};

module.exports.BOT = BOT;
