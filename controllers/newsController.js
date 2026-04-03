import TechNews from '../models/TechNews.js';

// ─── GET: FETCH ALL NEWS ───
export const getLatestNews = async (req, res) => {
  try {
    const newsDoc = await TechNews.findOne();
    res.json(newsDoc ? newsDoc.news : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST: UPDATE NEWS (Admin only) ───
export const updateNews = async (req, res) => {
  const { news } = req.body; 

  if (!Array.isArray(news) || news.length === 0) {
    return res.status(400).json({ error: 'News array is required' });
  }

  try {
    // We only keep the latest news document
    const updated = await TechNews.findOneAndUpdate(
      {}, 
      { news, lastUpdatedBy: req.user.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
