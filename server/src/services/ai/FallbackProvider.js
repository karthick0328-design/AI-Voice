import { AIProvider } from './AIProvider.js';

export class FallbackProvider extends AIProvider {
  constructor() {
    super('fallback');
  }

  async isHealthy() {
    return {
      available: true,
      message: 'Local Fallback Engine active (Ready for offline tasks and tool execution)'
    };
  }

  async listModels() {
    return [
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B (Recommended)', size: '4.7 GB' },
      { id: 'mistral:latest', name: 'Mistral 7B', size: '4.1 GB' },
      { id: 'gemma2:9b', name: 'Gemma 2 9B', size: '5.4 GB' }
    ];
  }

  async chatStream({ messages, tools = [], model, onToken, onToolCall }) {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const lower = lastMessage.toLowerCase();

    // Check if query should trigger tool calling
    let chosenTool = null;
    let toolArgs = {};

    if (lower.includes('time') || lower.includes('what time') || lower.includes('clock')) {
      chosenTool = 'getCurrentTime';
      toolArgs = {};
    } else if (lower.includes('calculate') || /[\d\s\+\-\*\/\(\)\^]{4,}/.test(lastMessage) && (lower.includes('+') || lower.includes('*') || lower.includes('/'))) {
      chosenTool = 'calculator';
      toolArgs = { expression: lastMessage.replace(/[^0-9\+\-\*\/\.\(\)]/g, '') || '2+2' };
    } else if (lower.includes('remind') || lower.includes('task') || lower.includes('todo')) {
      chosenTool = 'createTask';
      toolArgs = {
        title: lastMessage.replace(/remind me to|create task|add task/gi, '').trim() || 'New Reminder',
        priority: lower.includes('urgent') ? 'URGENT' : lower.includes('high') ? 'HIGH' : 'MEDIUM'
      };
    } else if (
      lower === 'pause' || lower === 'pause it' ||
      lower.includes('pause the song') || lower.includes('pause the video') ||
      lower.includes('stop the song') || lower.includes('stop playing')
    ) {
      chosenTool = 'youtubeControl';
      toolArgs = { operation: 'pause' };
    } else if (
      lower === 'resume' || lower === 'resume it' || lower === 'continue' ||
      lower.includes('resume the song') || lower.includes('resume the video') ||
      lower.includes('continue playing') || lower.includes('play it') ||
      (lower === 'play' && !lower.includes('youtube'))
    ) {
      chosenTool = 'youtubeControl';
      toolArgs = { operation: 'resume' };
    } else if (/(?:skip|go forward|fast forward|forward)\s*(\d+)/.test(lower)) {
      const m = lower.match(/(?:skip|go forward|fast forward|forward)\s*(\d+)/);
      chosenTool = 'youtubeControl';
      toolArgs = { operation: 'seek_forward', seconds: parseInt(m[1], 10) || 10 };
    } else if (/(?:go back|rewind|skip back|backward)\s*(\d+)/.test(lower)) {
      const m = lower.match(/(?:go back|rewind|skip back|backward)\s*(\d+)/);
      chosenTool = 'youtubeControl';
      toolArgs = { operation: 'seek_backward', seconds: parseInt(m[1], 10) || 10 };
    } else if (
      lower === 'next' || lower === 'next song' || lower === 'play next' ||
      lower.includes('next song') || lower.includes('next video') ||
      lower.includes('play the next') || lower.includes('play next song')
    ) {
      chosenTool = 'youtubeControl';
      toolArgs = { operation: 'next' };
    } else if (
      lower === 'previous' || lower === 'previous song' ||
      lower.includes('play previous') || lower.includes('previous video') ||
      lower.includes('play the previous') || lower.includes('go to previous')
    ) {
      chosenTool = 'youtubeControl';
      toolArgs = { operation: 'previous' };
    } else if (lower.includes('play the first') || lower === 'play') {
    } else if (lower.includes('browse') || lower.includes('chrome') || lower.includes('google') || lower.includes('open') || lower.includes('open website') || lower.includes('navigate to') || lower.includes('youtube')) {
      chosenTool = 'browserAutomation';
      if (lower.includes('youtube')) {
        toolArgs = {
          steps: [
            { action: 'open', target: 'youtube' },
            { action: 'search', query: lastMessage.replace(/open|youtube|play/gi, '').trim() },
            { action: 'play' }
          ]
        };
      } else if (lower.includes('google') || lower.includes('chrome')) {
        let exactQuery = lastMessage;
        ['open your', 'open', 'google', 'chrome', 'search', 'ask'].forEach(word => {
          exactQuery = exactQuery.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
        });
        exactQuery = exactQuery.trim();
        toolArgs = {
          steps: [
            { action: 'open', target: 'google' },
            { action: 'search', query: exactQuery }
          ]
        };
      } else {
        const urlMatch = lastMessage.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          toolArgs = { steps: [{ action: 'open', target: urlMatch[0] }] };
        } else {
          toolArgs = { steps: [{ action: 'open', target: 'google' }, { action: 'search', query: lastMessage }] };
        }
      }
    } else if (lower.includes('search') || lower.includes('what is') || lower.includes('latest') || lower.includes('news') || lower.includes('who is') || lower.includes('what is happening')) {
      chosenTool = 'webSearch';
      toolArgs = { query: lastMessage.replace(/search for|search|find|what is|mean by|mean/gi, '').trim() || lastMessage };
    } else if (lower.includes('remember') || lower.includes('my favorite') || lower.includes('i prefer')) {
      chosenTool = 'saveMemory';
      toolArgs = {
        content: lastMessage.replace(/remember that|remember/gi, '').trim() || lastMessage,
        type: lower.includes('prefer') ? 'PREFERENCE' : 'FACT',
        importance: 8
      };
    }

    if (chosenTool && onToolCall) {
      onToolCall({ name: chosenTool, arguments: toolArgs });
    }

    const defaultResponse = `I have received your request: "${lastMessage}".\n\n` +
      `I am operating in adaptive personal agent mode. When you launch Ollama locally (\`ollama run llama3.1:8b\`), I automatically connect to full local LLM inference!\n\n` +
      `In the meantime, your memories, tasks, automations, web search, and 3D avatar controls are fully live and operational.`;

    const tokens = defaultResponse.split(' ');
    for (const token of tokens) {
      await new Promise(r => setTimeout(r, 20));
      if (onToken) onToken(token + ' ');
    }

    return {
      content: defaultResponse,
      toolCalls: chosenTool ? [{ name: chosenTool, arguments: toolArgs }] : null,
      tokens: { prompt: 15, completion: tokens.length, total: 15 + tokens.length }
    };
  }

  async embed(text) {
    // Return deterministic normalized pseudo-embedding
    const vec = new Array(384).fill(0);
    for (let i = 0; i < text.length; i++) {
      vec[i % 384] += text.charCodeAt(i) / 255;
    }
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map(v => v / norm);
  }
}
