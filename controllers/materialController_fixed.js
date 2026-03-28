import Material from '../models/Material.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ── GET /api/materials ────────────────────────────────────────
export const getMaterials = async (req, res) => {
  try {
    const { tag } = req.query;

    const filter = tag ? { tags: tag } : {}; // ✅ filter by tag if provided

    const materials = await Material.find({ ...filter, isApproved: true })
      .populate('uploadedBy', 'name picture') // ✅ gets User details
      .populate('room', 'name')               // ✅ gets Room details
      .sort({ createdAt: -1 });               // ✅ newest first

    res.json(materials);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/materials/:id ────────────────────────────────────
export const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'name picture')
      .populate('room', 'name');

    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/materials ───────────────────────────────────────
export const createMaterial = async (req, res) => {
  const { title, type, category, tags, url, description, room } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  
  let finalUrl = url;
  let parsedTags = [];
  let resources = [];
  
  if (tags) {
      try {
          parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
          parsedTags = [tags];
      }
  }

  if (req.file) {
    finalUrl = `/uploads/materials/${req.file.filename}`;
    
    // Calculate size
    const sizeInBytes = req.file.size;
    const sizeStr = sizeInBytes > 1024 * 1024 
      ? (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB'
      : (sizeInBytes / 1024).toFixed(2) + ' KB';
      
    resources.push({
      name: req.file.originalname,
      type: 'PDF', // Assuming PDF for now based on context
      size: sizeStr,
      url: finalUrl
    });
  }

  // Allow empty cards to be created without a file or url
  // if (!finalUrl) return res.status(400).json({ error: 'URL or File is required' });

  try {
    const material = await Material.create({
      title,
      type:        type || 'document',
      category:    category || 'General',
      tags:        parsedTags,
      url:         finalUrl,
      description: description || '',
      room:        room || undefined,
      uploadedBy:  req.user.id,
      resources:   resources,
      isApproved:  false, // ⏳ requires admin approval
      likes:       0,
      downloads:   0,
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE /api/materials/:id ─────────────────────────────────
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findOneAndDelete({
      _id:        req.params.id,
      uploadedBy: req.user.id, // ✅ only uploader can delete
    });

    if (!material) return res.status(404).json({ error: 'Material not found or unauthorized' });
    res.json({ message: 'Material deleted ✅' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/materials/:id/like ───────────────────────────────
export const likeMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }, // ✅ increment likes by 1
      { new: true }
    );

    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/materials/:id/download ──────────────────────────
export const downloadMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } }, // ✅ increment downloads by 1
      { new: true }
    );

    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/materials/:id/save ────────────────────�// ── POST /api/materials/:id/unsave ────────────────────────────
export const unsaveMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $pull: { savedBy: req.user.id } },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/materials/:id/chat ──────────────────────────────
/**
 * Chat with an existing material (PDF) using Gemini File API
 */
export const chatWithMaterial = async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    if (!material.url || !material.url.startsWith('/uploads/')) {
      return res.status(400).json({ error: 'This material has no uploaded PDF file to chat with.' });
    }

    const filePath = path.join(__dirname, '..', material.url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF file not found on server.' });
    }

    // Step 1: Upload to Gemini File API
    const uploadRes = await fileManager.uploadFile(filePath, {
        mimeType: "application/pdf",
        displayName: material.title,
    });

    let file = await fileManager.getFile(uploadRes.file.name);
    while (file.state === 'PROCESSING') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        file = await fileManager.getFile(uploadRes.file.name);
    }

    // Step 2: Generate Content
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
        { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
        { text: `You are a helpful study assistant. Use the provided document to answer the student's question accurately. Focus on being clear and helpful.\n\nQuestion: ${question}` }
    ]);

    res.json({ answer: result.response.text() });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Failed to process: ' + err.message });
  }
};

// ── PDF Chat (Gemini File API Flow) ───────────────────────────

/**
 * Step 1: Upload ad-hoc PDF/file to Google File API
 */
export const extractPdfText = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const uploadResponse = await fileManager.uploadFile(req.file.path, {
            mimeType: req.file.mimetype,
            displayName: req.file.originalname,
        });

        // Wait for file to be ready
        let file = await fileManager.getFile(uploadResponse.file.name);
        while (file.state === 'PROCESSING') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            file = await fileManager.getFile(uploadResponse.file.name);
        }

        if (file.state === 'FAILED') throw new Error('Gemini failed to process PDF');

        res.json({ 
            success: true, 
            fileUri: file.uri, 
            fileName: req.file.originalname 
        });

        // Cleanup local file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    } catch (err) {
        console.error('PDF Upload error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Step 2: Use the File URI in a prompt for Q&A
 */
export const askPdf = async (req, res) => {
    try {
        const { fileUri, question } = req.body;
        if (!fileUri || !question) {
            return res.status(400).json({ error: 'Missing file URI or question' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: "application/pdf",
                    fileUri: fileUri
                }
            },
            { text: `You are an AI study assistant. Use the provided document to answer the student's question accurately. Focus on being clear and helpful.\n\nQuestion: ${question}` }
        ]);

        const response = await result.response;
        res.json({ answer: response.text() });
    } catch (err) {
        console.error('Gemini Ask error:', err);
        res.status(500).json({ error: err.message });
    }
};