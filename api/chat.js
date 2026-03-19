const https  = require('https');
const { BOT } = require('./config');

const SYSTEM_PROMPT = [BOT.prompt, BOT.knowledge ? `\n\n---\n\n## KNOWLEDGE BASE\n\n${BOT.knowledge}` : ''].join('');

module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const messages = req.body && req.body.messages;
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages array missing' });

  const payload = JSON.stringify({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system:     SYSTEM_PROMPT,
    messages,
  });

  try {
    const result = await new Promise((resolve, reject) => {
      const request = https.request({
        hostname: 'api.anthropic.com',
        path:     '/v1/messages',
        method:   'POST',
        headers: {
          'Content-Type':    'application/json',
          'Content-Length':  Buffer.byteLength(payload),
          'x-api-key':       apiKey,
          'anthropic-version': '2023-06-01',
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

    return res.status(result.status).json(JSON.parse(result.body));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
