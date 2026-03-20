const BOT = require('../bot.config');

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const credit = BOT.promptedBy
    ? `Powered by Claude · Prompted by ${BOT.promptedBy}`
    : 'Powered by Claude';

  return res.status(200).json({
    name:     BOT.name,
    tagline:  BOT.tagline,
    avatar:   BOT.avatar   || '',
    starters: BOT.starters || [],
    credit,
  });
};
