const fs = require('fs');

const data = fs.readFileSync('controllers/materialController_fixed.js', 'utf8');

let fixedData = data.replace(
  /\/\/ ── POST \/api\/materials\/:id\/save ─────────+[^]*?\/\/ ── POST \/api\/materials\/:id\/unsave ─────────+/,
  `// ── POST /api/materials/:id/save ──────────────────────────────
export const saveMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { savedBy: req.user.id } },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Material not found' });
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/materials/:id/unsave ────────────────────────────`
);

let finalData = fixedData.replace(
  /pful study assistant[\s\S]*Answer clearly and concisely\.`;\r?\n\r?\n    const result = await model\.generateContent\(prompt\);\r?\n    const answer = result\.response\.text\(\);\r?\n\r?\n    res\.json\(\{ answer \}\);\r?\n  \} catch \(err\) \{\r?\n    console\.error\('Ask PDF error:', err\.message\);\r?\n    res\.status\(500\)\.json\(\{ error: 'AI failed to answer: ' \+ err\.message \}\);\r?\n  \}\r?\n\};/,
  ''
);

fs.writeFileSync('controllers/materialController.js', finalData, 'utf8');
console.log('Fixed materialController.js');
