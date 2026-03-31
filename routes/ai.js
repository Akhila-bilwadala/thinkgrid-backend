import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// ── Multer Config ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/temp-ai';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, and Text files are supported'));
    }
  }
});

// ── AI Config ──────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

const PROMPT_MAP = {
  summarize: "Provide a concise, high-level summary of the following document. Focus on key themes and takeaways.",
  cheatsheet: "Create a structured 'Cheat Sheet' from this document. Use bullet points, bold key terms, and organize by logical sections. Make it dense but readable for exam preparation.",
  mindmap: "Convert the key concepts of this document into a hierarchical structured list that represents a 'Mind Map'. Highlight the central theme and branch out into sub-topics.",
  resolve_doubts: "Act as an expert tutor. Based on this document, explain the most complex parts simply and be ready to answer follow-up questions. Focus on clarifying potentially confusing concepts."
};

/**
 * Generate AI Content using Gemini Flash
 */
async function generateAIContent(parts) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    return await model.generateContent(parts);
}


/**
 * Helper to upload file to Gemini File API and wait for it to be ready
 */
async function uploadAndPoll(filePath, displayName, mimeType) {
    const uploadRes = await fileManager.uploadFile(filePath, {
        mimeType,
        displayName,
    });

    let file = await fileManager.getFile(uploadRes.file.name);
    while (file.state === 'PROCESSING') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        file = await fileManager.getFile(uploadRes.file.name);
    }

    if (file.state === 'FAILED') {
        throw new Error('Gemini File API failed to process the document.');
    }

    return file;
}

// ── Route: Process Document ─────────────────────────────────────
router.post('/process-document', [authMiddleware, upload.single('file')], async (req, res) => {
  const { action } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  if (!action || !PROMPT_MAP[action]) return res.status(400).json({ error: 'Invalid or missing action' });

  try {
    const ext = path.extname(file.originalname).toLowerCase();
    let result;

    if (ext === '.pdf') {
        // PDF: Native Gemini File API
        const geminiFile = await uploadAndPoll(file.path, file.originalname, 'application/pdf');
        result = await generateAIContent([
            { fileData: { mimeType: geminiFile.mimeType, fileUri: geminiFile.uri } },
            { text: PROMPT_MAP[action] }
        ]);

    } else {
        // Word/Text: Local extraction
        const textContent = (ext === '.docx' || ext === '.doc') 
            ? (await mammoth.extractRawText({ buffer: fs.readFileSync(file.path) })).value
            : fs.readFileSync(file.path, 'utf-8');

        if (!textContent || textContent.trim().length < 10) {
            throw new Error('Could not extract meaningful text from document.');
        }

        const prompt = `${PROMPT_MAP[action]}\n\nDOCUMENT CONTENT:\n${textContent.substring(0, 30000)}`;
        result = await generateAIContent(prompt);

    }

    const responseText = result.response.text();

    // Cleanup local temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    res.json({ result: responseText });

  } catch (err) {
    console.error('AI Processing Error:', err.message);
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ error: err.message || 'Failed to process document with AI' });
  }
});

export default router;
