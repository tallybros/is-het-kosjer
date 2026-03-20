const https = require('https');
const BOT   = require('../bot.config');

const SYSTEM_PROMPT = BOT.prompt + (BOT.knowledge ? `\n\n---\n\n## KNOWLEDGE BASE\n\n${BOT.knowledge}` : '');
const MODEL = BOT.model || 'gpt-4o-mini';

module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages array missing' });

  const body = {
    model: MODEL,
    instructions: SYSTEM_PROMPT,
    input: messages,
  };

  if (BOT.webSearch) {
    body.tools = [{ type: 'web_search_preview' }];
  }

  const payload = JSON.stringify(body);

  try {
    const result = await new Promise((resolve, reject) => {
      const request = https.request({
        hostname: 'api.openai.com',
        path:     '/v1/responses',
        method:   'POST',
        headers: {
          'Content-Type':  'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Authorization': `Bearer ${apiKey}`,
        },
      }, (response) => {
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end',  () => resolve({ status: response.statusCode, body: data }));
      });
      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    const parsed = JSON.parse(result.body);

    if (result.status !== 200) {
      const errMsg = parsed.error?.message || JSON.stringify(parsed);
      console.error('OpenAI error:', result.status, errMsg);
      return res.status(result.status).json({ error: errMsg });
    }

    // Debug: log the response shape
    console.log('OpenAI response status:', result.status);
    console.log('OpenAI output types:', (parsed.output || []).map(b => b.type));

    // Extract text from OpenAI responses API output
    const text = (parsed.output || [])
      .filter(b => b.type === 'message')
      .flatMap(b => b.content || [])
      .filter(c => c.type === 'output_text')
      .map(c => c.text)
      .join('\n')
      .trim();

    return res.status(200).json({
      content: [{ type: 'text', text: text || 'I could not find an answer. Please try again.' }]
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
