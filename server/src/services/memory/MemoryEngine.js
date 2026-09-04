import { Memory } from '../../models/Memory.js';

class MemoryEngine {
  /**
   * Search and retrieve top-K relevant memories for current user prompt
   */
  async getRelevantMemories(userId = 'default-user', queryText = '', limit = 4) {
    try {
      if (!queryText || !queryText.trim()) {
        return await Memory.find({ userId, active: true }).sort({ importance: -1, updatedAt: -1 }).limit(limit);
      }

      // Extract significant keywords
      const words = queryText
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['what', 'when', 'where', 'which', 'about', 'please', 'could', 'would'].includes(w));

      if (words.length === 0) {
        return await Memory.find({ userId, active: true }).sort({ importance: -1 }).limit(limit);
      }

      const regexList = words.map(w => new RegExp(w, 'i'));
      const memories = await Memory.find({
        userId,
        active: true,
        $or: [
          { content: { $in: regexList } },
          { tags: { $in: regexList } }
        ]
      })
      .sort({ importance: -1, updatedAt: -1 })
      .limit(limit);

      return memories;
    } catch (err) {
      console.warn('[MemoryEngine] Memory retrieval error:', err.message);
      return [];
    }
  }

  /**
   * Inspect user input and extract persistent facts / preferences
   */
  async extractAndSaveMemory(userId = 'default-user', messageText = '', conversationId = null) {
    if (!messageText || messageText.length < 8) return null;

    const lower = messageText.toLowerCase();
    let memoryCandidate = null;
    let type = 'FACT';
    let importance = 6;
    let tags = [];

    // Rule patterns for memory extraction
    if (/(?:remember that|please remember|don't forget that)\s+(.*)/i.test(messageText)) {
      const match = messageText.match(/(?:remember that|please remember|don't forget that)\s+(.*)/i);
      memoryCandidate = match ? match[1].trim() : null;
      importance = 9;
      type = 'INSTRUCTION';
    } else if (/(?:i prefer|my preference is|always use|i like)\s+(.*)/i.test(messageText)) {
      memoryCandidate = messageText.trim();
      type = 'PREFERENCE';
      importance = 8;
      tags.push('preference');
    } else if (/(?:i am working on|my project is|our project is)\s+(.*)/i.test(messageText)) {
      memoryCandidate = messageText.trim();
      type = 'PROJECT';
      importance = 8;
      tags.push('project');
    } else if (/(?:my name is|i live in|my email is|i work at|my role is)\s+(.*)/i.test(messageText)) {
      memoryCandidate = messageText.trim();
      type = 'FACT';
      importance = 9;
      tags.push('identity');
    }

    if (memoryCandidate) {
      // Check if duplicate already exists
      const existing = await Memory.findOne({
        userId,
        content: new RegExp(memoryCandidate.slice(0, 30), 'i')
      });

      if (!existing) {
        const memory = await Memory.create({
          userId,
          type,
          content: memoryCandidate,
          importance,
          tags,
          sourceConversationId: conversationId
        });
        console.log(`[MemoryEngine] Saved new long-term memory: "${memory.content}"`);
        return memory;
      }
    }
    return null;
  }
}

export const memoryEngine = new MemoryEngine();
