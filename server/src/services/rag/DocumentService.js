import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { Document, DocumentChunk } from '../../models/Document.js';

class DocumentService {
  /**
   * Split text into overlapping chunks
   */
  chunkText(text, chunkSize = 600, overlap = 100) {
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      const chunk = text.slice(startIndex, endIndex).trim();
      if (chunk.length > 20) {
        chunks.push(chunk);
      }
      startIndex += chunkSize - overlap;
    }
    return chunks;
  }

  /**
   * Process and index an uploaded document
   */
  async processDocument({ filePath, originalName, mimeType, size, category = 'General', userId = 'default-user' }) {
    let extractedText = '';
    const ext = originalName.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else {
      // txt, markdown, doc, etc.
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    // Clean text
    extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    // Create Document record
    const doc = await Document.create({
      userId,
      title: originalName.replace(/\.[^/.]+$/, ''),
      fileName: originalName,
      fileType: ext,
      fileSize: size,
      filePath,
      category,
      summary: extractedText.slice(0, 250) + '...',
      status: 'PROCESSING'
    });

    // Chunk text
    const textChunks = this.chunkText(extractedText);
    const chunkDocs = textChunks.map((content, index) => ({
      documentId: doc._id,
      chunkIndex: index,
      content,
      tokens: Math.round(content.length / 4),
      metadata: {
        title: doc.title,
        category: doc.category,
        pageNumber: Math.floor(index / 2) + 1
      }
    }));

    if (chunkDocs.length > 0) {
      await DocumentChunk.insertMany(chunkDocs);
    }

    doc.chunkCount = chunkDocs.length;
    doc.status = 'READY';
    await doc.save();

    return { document: doc, chunksCreated: chunkDocs.length };
  }

  /**
   * Semantic / Text search across indexed chunks
   */
  async searchKnowledge(query, limit = 4) {
    if (!query || !query.trim()) return [];

    const keywords = query
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

    if (keywords.length === 0) return [];

    const regex = new RegExp(keywords.join('|'), 'i');
    const chunks = await DocumentChunk.find({ content: regex })
      .populate('documentId', 'title category fileName')
      .limit(limit);

    return chunks.map(c => ({
      content: c.content,
      title: c.metadata?.title || c.documentId?.title || 'Document',
      category: c.metadata?.category || 'General',
      page: c.metadata?.pageNumber || 1
    }));
  }
}

export const documentService = new DocumentService();
