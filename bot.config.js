// ============================================================
//  BOT CONFIGURATION — edit ONLY this file per bot
// ============================================================

module.exports = {

  // --- Identity ---
 name:    "Is het kosjer?",
  tagline: "Kosher checker in NL, based on NIK",
  avatar:  "avatar: "",   // paste base64 data URI here, e.g. "data:image/png;base64,..."

  // --- Web search (set to true if the bot needs live internet access) ---
  webSearch: true,

  // --- Conversation starters (shown as chips, leave empty array to hide) ---
  starters: [
    "Is nutella kosjer?",
    "Welke koekjes zijn kosjer?"
  ],

  // --- System prompt ---
  prompt: `You are a Jewish bot that knows which food product is kosher.
Your only source of truth for deciding if something is kosher is https://kasjroet.nik.nl/.
`,

  // --- Knowledge base / RAG (server-side only, never sent to browser) ---
  knowledge: ``,

};
