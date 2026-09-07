import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { handleChatStream, handleChatSync } from '../controllers/chatController.js';
import * as convController from '../controllers/conversationController.js';
import * as memoryController from '../controllers/memoryController.js';
import * as taskController from '../controllers/taskController.js';
import * as autoController from '../controllers/automationController.js';
import * as docController from '../controllers/documentController.js';
import * as modelController from '../controllers/modelController.js';
import * as settingsController from '../controllers/settingsController.js';
import { toolRegistry } from '../services/tools/ToolRegistry.js';

const router = express.Router();

// Setup Multer for document uploads
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Chat & Streaming
router.post('/chat', handleChatSync);
router.post('/chat/stream', handleChatStream);

// Conversations
router.get('/conversations', convController.getConversations);
router.get('/conversations/:id/messages', convController.getConversationMessages);
router.patch('/conversations/:id', convController.updateConversation);
router.delete('/conversations/:id', convController.deleteConversation);

// Memories
router.get('/memories', memoryController.getMemories);
router.post('/memories', memoryController.createMemory);
router.patch('/memories/:id', memoryController.updateMemory);
router.delete('/memories/:id', memoryController.deleteMemory);
router.delete('/memories', memoryController.clearAllMemories);

// Tasks
router.get('/tasks', taskController.getTasks);
router.post('/tasks', taskController.createTask);
router.patch('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

// Automations
router.get('/automations', autoController.getAutomations);
router.post('/automations', autoController.createAutomation);
router.post('/automations/:id/run', autoController.runAutomationNow);
router.patch('/automations/:id/toggle', autoController.toggleAutomationStatus);
router.delete('/automations/:id', autoController.deleteAutomation);

// Documents & RAG
router.post('/documents/upload', upload.single('file'), docController.uploadDocument);
router.get('/documents', docController.getDocuments);
router.post('/documents/search', docController.searchDocuments);
router.delete('/documents/:id', docController.deleteDocument);

// Models & Health
router.get('/models', modelController.getModels);
router.get('/health', modelController.checkHealth);

// Settings
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

// YouTube Search & Real-Time Player Control
import * as youtubeController from '../controllers/youtubeController.js';
router.get('/youtube/search', youtubeController.searchYouTube);
router.post('/youtube/control', youtubeController.executeControl);
router.get('/youtube/status', youtubeController.getStatus);

// Google Real Browser Automation
import * as googleController from '../controllers/googleController.js';
router.post('/google/open', googleController.openGoogle);
router.post('/google/search', googleController.searchGoogle);
router.post('/google/action', googleController.executeGoogleAction);

// Tools info
router.get('/tools', (req, res) => {
  res.json(toolRegistry.getAllTools().map(t => ({
    name: t.name,
    description: t.description,
    permissionLevel: t.permissionLevel,
    parameters: t.parameters
  })));
});

export default router;

