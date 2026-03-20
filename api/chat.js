const https = require('https');
const BOT   = require('../bot.config');

const SYSTEM_PROMPT = BOT.prompt + (BOT.knowledge ? `\n\n---\n\n## KNOWLEDGE BASE\n\n${BOT.knowledge}` : '');
const API   = BOT.api   || 'anthropic';
const MODEL = BOT.model || (API === 'openai' ? 'gpt-4o-mini' : 'claude-haiku-4-5-20251001');

function callAnthropic(apiKey, messages) {
  const body = {
    model:      MODEL,
    max_tokens: 1024,
    system:     SYSTEM_PROMPT,
    messages,
  };
  if (BOT.webSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'Content-Length':    Buffer.byteLength(payload),
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode !== 200) throw new Error(parsed.error?.message || `Anthropic error ${res.statusCode}`);
        const text = (parsed.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
        resolve(text);
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function callOpenAI(apiKey, messages) {
  const body = {
    model:        MODEL,
    instructions: SYSTEM_PROMPT,
    input:        messages,
  };
  if (BOT.webSearch) {
    body.tools = [{ type: 'web_search_preview' }];
  }
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path:     '/v1/responses',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization':  `Bearer ${apiKey}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode !== 200) throw new Error(parsed.error?.message || `OpenAI error ${res.statusCode}`);
        const text = (parsed.output || [])
          .filter(b => b.type === 'message')
          .flatMap(b => b.content || [])
          .filter(c => c.type === 'output_text')
          .map(c => c.text)
          .join('\n').trim();
        resolve(text);
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const apiKey = API === 'openai'
    ? process.env.OPENAI_API_KEY
    : process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return res.status(500).json({ error: `${API.toUpperCase()}_API_KEY not set in environment variables` });

  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages array missing' });

  try {
    const text = API === 'openai'
      ? await callOpenAI(apiKey, messages)
      : await callAnthropic(apiKey, messages);

    return res.status(200).json({
      content: [{ type: 'text', text: text || 'I could not generate a response. Please try again.' }]
    });
  } catch (err) {
    console.error('API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
