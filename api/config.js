const BOT = require('../bot.config');

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    name:     BOT.name,
    tagline:  BOT.tagline,
    avatar:   BOT.avatar   || '',
    starters: BOT.starters || [],
    credit:   BOT.credit   || 'Powered by Claude',
  });
};
