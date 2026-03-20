const https = require('https');
const BOT   = require('../bot.config');

const SYSTEM_PROMPT = BOT.prompt + (BOT.knowledge ? `\n\n---\n\n## KNOWLEDGE BASE\n\n${BOT.knowledge}` : '');
const API   = BOT.api   || 'anthropic';
const MODEL = BOT.model || (API === 'openai' ? 'gpt-4o-mini' : 'claude-haiku-4-5-20251001');

async function callAnthropic(messages, apiKey) {
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
  const result  = await httpsPost('api.anthropic.com', '/v1/messages', payload, {
    'Content-Type':      'application/json',
    'Content-Length':    Buffer.byteLength(payload),
    'x-api-key':         apiKey,
    'anthropic-version': '2023-06-01',
  });
  const parsed = JSON.parse(result.body);
  if (result.status !== 200) throw new Error(parsed.error?.message || JSON.stringify(parsed));
  const text = (parsed.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  return text;
}

async function callOpenAI(messages, apiKey) {
  const body = {
    model:        MODEL,
    instructions: SYSTEM_PROMPT,
    input:        messages,
  };
  if (BOT.webSearch) {
    body.tools = [{ type: 'web_search_preview' }];
  }
  const payload = JSON.stringify(body);
  const result  = await httpsPost('api.openai.com', '/v1/responses', payload, {
    'Content-Type':   'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Authorization':  `Bearer ${apiKey}`,
  });
  const parsed = JSON.parse(result.body);
  if (result.status !== 200) throw new Error(parsed.error?.message || JSON.stringify(parsed));
  const text = (parsed.output || [])
    .filter(b => b.type === 'message')
    .flatMap(b => b.content || [])
    .filter(c => c.type === 'output_text')
    .map(c => c.text)
    .join('\n')
    .trim();
  return text;
}

function httpsPost(hostname, path, payload, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'POST', headers }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end',  () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages array missing' });

  try {
    let text;
    if (API === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set in Vercel environment variables' });
      text = await callOpenAI(messages, apiKey);
    } else {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in Vercel environment variables' });
      text = await callAnthropic(messages, apiKey);
    }

    return res.status(200).json({
      content: [{ type: 'text', text: text || 'I could not generate a response. Please try again.' }]
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
