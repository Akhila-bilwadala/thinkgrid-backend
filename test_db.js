import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const materialSchema = new mongoose.Schema({
  title: String,
  resources: Array
});

const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const materials = await Material.find().sort({ createdAt: -1 }).limit(5);
    materials.forEach(m => {
      console.log(`\nTitle: ${m.title}`);
      console.log(`Resources:`, JSON.stringify(m.resources, null, 2));
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
