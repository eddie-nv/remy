const { scrapeProducts } = require('../scaper/scrape');

const getStoreProducts = async (req, res) => {
  try {
    const force = req.query.force === '1';
    const data = await scrapeProducts({ force });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'scrape_failed' });
  }
};

module.exports = { getStoreProducts };