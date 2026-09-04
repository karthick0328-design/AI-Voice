import { toolRegistry } from '../src/services/tools/ToolRegistry.js';
import { memoryEngine } from '../src/services/memory/MemoryEngine.js';
import { documentService } from '../src/services/rag/DocumentService.js';
import { aiService } from '../src/services/ai/index.js';
import { connectDatabase } from '../src/config/db.js';
import { Task } from '../src/models/Task.js';
import { Memory } from '../src/models/Memory.js';
import { Conversation } from '../src/models/Conversation.js';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE AI AGENT SYSTEM TESTS ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Database Connection
    const conn = await connectDatabase();
    assert(conn !== null, 'MongoDB connection established');

    // 2. AIService & Model Health
    const health = await aiService.getHealthStatus();
    assert(typeof health === 'object' && health !== null, 'AI Service health status check returns object');

    const models = await aiService.listModels();
    assert(Array.isArray(models) && models.length > 0, `Models listed successfully (${models.length} models)`);

    // 3. Tool Registry Validation
    const allTools = toolRegistry.getAllTools();
    assert(allTools.length >= 10, `ToolRegistry loaded ${allTools.length} tools (expected >= 10)`);

    // Test tool: getCurrentTime
    const timeRes = await toolRegistry.executeTool('getCurrentTime', {});
    assert(timeRes.success && timeRes.data.time, 'Tool getCurrentTime executes successfully');

    // Test tool: calculator
    const calcRes = await toolRegistry.executeTool('calculator', { expression: '12 * 12 + 6' });
    assert(calcRes.success && calcRes.data.result === 150, 'Tool calculator evaluates correctly: 12*12+6 = 150');

    // Test tool: webSearch
    const searchRes = await toolRegistry.executeTool('webSearch', { query: 'Node.js LTS version', maxResults: 2 });
    assert(searchRes.success && Array.isArray(searchRes.data.results), 'Tool webSearch returns structured results');

    // 4. Memory Extraction & Relevance
    const testConv = await Conversation.create({ title: 'Test Conversation' });
    const memory = await memoryEngine.extractAndSaveMemory('test-user', 'Remember that I prefer React and Node with local Ollama models.', testConv._id);
    assert(memory !== null && memory.content.includes('prefer React'), 'Memory engine successfully extracts persistent preference');

    const retrievedMemories = await memoryEngine.getRelevantMemories('test-user', 'What do I prefer for my stack?');
    assert(retrievedMemories.length > 0, 'Memory relevance search retrieves matching long-term memories');

    // 5. Smart Tasks & Reminders
    const taskRes = await toolRegistry.executeTool('createTask', {
      title: 'Automated test reminder',
      priority: 'HIGH',
      description: 'Verify system test suite'
    });
    assert(taskRes.success && taskRes.data.priority === 'HIGH', 'Task created via agent tool successfully');

    const getTasksRes = await toolRegistry.executeTool('getTasks', { status: 'TODO' });
    assert(getTasksRes.success && getTasksRes.data.length > 0, 'Tasks retrieved via agent tool');

    // 6. RAG Document Ingestion & Chunking
    const testFilePath = path.resolve('test-rag-sample.txt');
    fs.writeFileSync(testFilePath, 'Antigravity AI Agent Architecture.\nThe system utilizes local Ollama LLMs with llama3.1:8b.\nTools include Puppeteer browser automation, web search, memory pipeline, and automated task execution.\nData is stored persistently in MongoDB.');

    const ragResult = await documentService.processDocument({
      filePath: testFilePath,
      originalName: 'test-rag-sample.txt',
      mimeType: 'text/plain',
      size: fs.statSync(testFilePath).size,
      category: 'Project Documentation',
      userId: 'test-user'
    });
    assert(ragResult.document && ragResult.chunksCreated > 0, `RAG document processed into ${ragResult.chunksCreated} semantic chunks`);

    const ragSearch = await documentService.searchKnowledge('Puppeteer browser automation');
    assert(ragSearch.length > 0 && ragSearch[0].content.includes('Puppeteer'), 'RAG knowledge search returns relevant chunk context');

    // Cleanup test artifacts
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    await Memory.deleteMany({ userId: 'test-user' });
    await Task.deleteMany({ title: 'Automated test reminder' });
    await Conversation.findByIdAndDelete(testConv._id);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
