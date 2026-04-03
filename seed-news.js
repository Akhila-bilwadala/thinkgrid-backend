import mongoose from 'mongoose';
import 'dotenv/config';
import TechNews from './models/TechNews.js';

async function seedRealNews() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const newsData = [
            { 
              title: 'OpenAI Previews "Sora" AI Video Model', 
              url: 'https://openai.com/sora', 
              source: 'OpenAI' 
            },
            { 
              title: 'Apple Announces WWDC 2026 for June 10th', 
              url: 'https://apple.com/newsroom', 
              source: 'Apple Newsroom' 
            }
        ];
        
        await TechNews.findOneAndUpdate({}, { news: newsData }, { upsert: true, new: true });
        console.log('REAL NEWS SEEDED SUCCESSFULLY!');
    } catch (e) {
        console.error('SEED ERROR:', e.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedRealNews();
