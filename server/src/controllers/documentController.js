import path from 'path';
import fs from 'fs';
import { Document, DocumentChunk } from '../models/Document.js';
import { documentService } from '../services/rag/DocumentService.js';

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { category = 'General' } = req.body;
    const result = await documentService.processDocument({
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      category,
      userId: 'default-user'
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('[documentController] Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { userId: 'default-user' };
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    const docs = await Document.find(filter).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchDocuments = async (req, res) => {
  try {
    const { query } = req.body;
    const results = await documentService.searchKnowledge(query, 5);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);
    if (doc && doc.filePath && fs.existsSync(doc.filePath)) {
      try { fs.unlinkSync(doc.filePath); } catch (e) {}
    }
    await Document.findByIdAndDelete(id);
    await DocumentChunk.deleteMany({ documentId: id });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
