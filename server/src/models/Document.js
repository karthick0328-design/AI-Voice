import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  chunkIndex: { type: Number, required: true },
  content: { type: String, required: true },
  tokens: { type: Number, default: 0 },
  embedding: [{ type: Number }], // optional vector float array
  metadata: {
    title: { type: String, default: '' },
    category: { type: String, default: 'General' },
    pageNumber: { type: Number, default: 1 }
  },
  createdAt: { type: Date, default: Date.now }
});

documentChunkSchema.index({ content: 'text' });

export const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);

const documentSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user', index: true },
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true }, // 'pdf', 'txt', 'markdown', 'docx'
  fileSize: { type: Number, default: 0 },
  filePath: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Study Material', 'Work Documents', 'Project Documentation', 'Personal Notes', 'General'],
    default: 'General'
  },
  chunkCount: { type: Number, default: 0 },
  summary: { type: String, default: '' },
  status: { type: String, enum: ['PROCESSING', 'READY', 'FAILED'], default: 'READY' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

documentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Document = mongoose.model('Document', documentSchema);
