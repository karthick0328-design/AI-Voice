import { webSearchService } from './WebSearchService.js';
import { puppeteerService } from '../browser/PuppeteerService.js';
import { Task } from '../../models/Task.js';
import { Memory } from '../../models/Memory.js';
import { DocumentChunk } from '../../models/Document.js';

export const PERMISSION_LEVELS = {
  READ_ONLY: 'READ_ONLY',
  LOW_RISK: 'LOW_RISK',
  REQUIRES_CONFIRMATION: 'REQUIRES_CONFIRMATION'
};

class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.registerCoreTools();
  }

  registerTool(tool) {
    if (!tool.name || !tool.description || !tool.execute) {
      throw new Error(`Tool definition invalid for ${tool.name || 'unnamed'}`);
    }
    this.tools.set(tool.name, {
      permissionLevel: PERMISSION_LEVELS.READ_ONLY,
      parameters: { type: 'object', properties: {} },
      ...tool
    });
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getToolsForLLM() {
    // Only return the most essential tools to prevent crashing local LLMs
    // with massive context windows (which causes ECONNRESET on slower PCs)
    const essentialToolNames = ['browserAutomation', 'youtubeControl', 'webSearch', 'deepKnowledgeSearch', 'createTask', 'saveMemory', 'getCurrentTime'];
    
    return Array.from(this.tools.values())
      .filter(t => essentialToolNames.includes(t.name))
      .map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }));
  }

  async executeTool(name, input = {}, context = {}, onProgress = () => {}) {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool '${name}' is not registered in ToolRegistry`);
    }

    const startTime = Date.now();
    try {
      // Validate permissions or context if needed here in the future
      const result = await tool.execute(input, context, onProgress);
      const duration = Date.now() - startTime;
      return {
        success: true,
        data: result,
        duration,
        permissionLevel: tool.permissionLevel
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        duration,
        permissionLevel: tool.permissionLevel
      };
    }
  }

  registerCoreTools() {
    // 1. getCurrentTime
    this.registerTool({
      name: 'getCurrentTime',
      description: 'Get the current local time, date, and timezone offset',
      permissionLevel: PERMISSION_LEVELS.READ_ONLY,
      parameters: {
        type: 'object',
        properties: {
          timezone: { type: 'string', description: 'Optional timezone name, defaults to system local' }
        }
      },
      execute: async () => {
        const now = new Date();
        return {
          iso: now.toISOString(),
          localString: now.toLocaleString(),
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
      }
    });

    // 2. calculator
    this.registerTool({
      name: 'calculator',
      description: 'Safely evaluate a mathematical or arithmetic expression (e.g. 25 * 400 + 15)',
      permissionLevel: PERMISSION_LEVELS.READ_ONLY,
      parameters: {
        type: 'object',
        required: ['expression'],
        properties: {
          expression: { type: 'string', description: 'The math expression to evaluate' }
        }
      },
      execute: async ({ expression }) => {
        const sanitized = expression.replace(/[^0-9+\-*/().^%]/g, '');
        if (!sanitized) throw new Error('Invalid mathematical expression');
        // Evaluate safe arithmetic
        const fn = new Function(`return (${sanitized})`);
        const result = fn();
        return { expression: sanitized, result };
      }
    });

    // 3. webSearch
    this.registerTool({
      name: 'webSearch',
      description: 'Search the internet for up-to-date facts, current events, documentation, and news',
      permissionLevel: PERMISSION_LEVELS.LOW_RISK,
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', description: 'Search term or query' },
          maxResults: { type: 'number', description: 'Number of results to return (1-5)' }
        }
      },
      execute: async ({ query, maxResults = 4 }) => {
        return await webSearchService.search(query, maxResults);
      }
    });

    // 4. openWebPage
    this.registerTool({
      name: 'openWebPage',
      description: 'Navigate to a specific URL and extract its text content using browser automation',
      permissionLevel: PERMISSION_LEVELS.LOW_RISK,
      parameters: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', description: 'The web page URL to open' }
        }
      },
      execute: async ({ url }) => {
        await puppeteerService.navigate(url);
        const content = await puppeteerService.extractContent();
        return content;
      }
    });

    // 5. browserAutomation
    this.registerTool({
      name: 'browserAutomation',
      description: 'Execute multi-step browser tasks like opening YouTube, searching, playing videos, or navigating Google.',
      permissionLevel: PERMISSION_LEVELS.LOW_RISK,
      parameters: {
        type: 'object',
        required: ['steps'],
        properties: {
          steps: {
            type: 'array',
            description: 'Ordered list of browser actions to execute',
            items: {
              type: 'object',
              required: ['action'],
              properties: {
                action: { type: 'string', enum: ['open', 'search', 'play'] },
                target: { type: 'string', description: 'Target website (e.g. youtube, google)' },
                query: { type: 'string', description: 'Search query' }
              }
            }
          }
        }
      },
      execute: async ({ steps }, context, onProgress) => {
        return await puppeteerService.executeTask(steps, onProgress);
      }
    });

    // 5b. youtubeControl — real-time media control for the CURRENT playing video
    this.registerTool({
      name: 'youtubeControl',
      description: 'Control the currently playing YouTube video. Use for: play, pause, resume, restart, seek forward/backward/to, next, previous, mute, unmute, volume up/down/set, fullscreen on/off, playback speed, captions on/off, scroll, like/unlike, subscribe/unsubscribe, browser back/forward, get status.',
      permissionLevel: PERMISSION_LEVELS.LOW_RISK,
      parameters: {
        type: 'object',
        required: ['operation'],
        properties: {
          operation: {
            type: 'string',
            enum: [
              'play', 'pause', 'resume', 'stop', 'restart',
              'next', 'previous', 'seek_forward', 'seek_backward', 'seek_to',
              'mute', 'unmute', 'volume_up', 'volume_down', 'set_volume',
              'fullscreen', 'exit_fullscreen', 'set_playback_rate',
              'captions_on', 'captions_off',
              'scroll_down', 'scroll_up', 'scroll_to_comments',
              'like', 'unlike', 'subscribe', 'unsubscribe',
              'browser_back', 'browser_forward',
              'status', 'current_status'
            ],
            description: 'The media operation to perform'
          },
          seconds: {
            type: 'number',
            description: 'Number of seconds to seek or absolute timestamp to seek to.'
          },
          volume: {
            type: 'number',
            description: 'Volume level (0-100 or 0.0-1.0) for set_volume, or step amount for volume_up/down.'
          },
          rate: {
            type: 'number',
            description: 'Playback speed multiplier (e.g. 0.5, 1.25, 1.5, 2).'
          },
          pixels: {
            type: 'number',
            description: 'Pixels to scroll for scroll_down/scroll_up.'
          }
        }
      },
      execute: async ({ operation, seconds = 10, volume, rate, pixels = 400 }) => {
        switch (operation) {
          case 'play':
          case 'resume':         return await puppeteerService.resumeVideo();
          case 'pause':
          case 'stop':           return await puppeteerService.pauseVideo();
          case 'restart':        return await puppeteerService.restartVideo();
          case 'next':           return await puppeteerService.nextVideo();
          case 'previous':       return await puppeteerService.previousVideo();
          case 'seek_forward':   return await puppeteerService.seekVideo(seconds, 'forward');
          case 'seek_backward':  return await puppeteerService.seekVideo(seconds, 'backward');
          case 'seek_to':        return await puppeteerService.seekTo(seconds);
          case 'mute':           return await puppeteerService.muteVideo();
          case 'unmute':         return await puppeteerService.unmuteVideo();
          case 'volume_up':      return await puppeteerService.volumeUp(volume || 0.15);
          case 'volume_down':    return await puppeteerService.volumeDown(volume || 0.15);
          case 'set_volume':     return await puppeteerService.setVolume(volume ?? 50);
          case 'fullscreen':     return await puppeteerService.enableFullscreen();
          case 'exit_fullscreen': return await puppeteerService.exitFullscreen();
          case 'set_playback_rate': return await puppeteerService.setPlaybackRate(rate || 1.0);
          case 'captions_on':    return await puppeteerService.captionsOn();
          case 'captions_off':   return await puppeteerService.captionsOff();
          case 'scroll_down':    return await puppeteerService.scrollDown(pixels);
          case 'scroll_up':      return await puppeteerService.scrollUp(pixels);
          case 'scroll_to_comments': return await puppeteerService.scrollToComments();
          case 'like':           return await puppeteerService.likeVideo();
          case 'unlike':         return await puppeteerService.unlikeVideo();
          case 'subscribe':      return await puppeteerService.subscribeChannel();
          case 'unsubscribe':    return await puppeteerService.unsubscribeChannel();
          case 'browser_back':   return await puppeteerService.browserBack();
          case 'browser_forward': return await puppeteerService.browserForward();
          case 'status':
          case 'current_status': return await puppeteerService.getVideoStatus();
          default: throw new Error(`Unknown youtubeControl operation: ${operation}`);
        }
      }
    });

    // 6. createTask
    this.registerTool({
      name: 'createTask',
      description: 'Create a new task, todo, or reminder for the user',
      permissionLevel: PERMISSION_LEVELS.LOW_RISK,
      parameters: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', description: 'Task title or action item' },
          description: { type: 'string', description: 'Detailed instructions or notes' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], description: 'Task priority level' },
          dueDate: { type: 'string', description: 'ISO date string or human relative date' }
        }
      },
      execute: async ({ title, description = '', priority = 'MEDIUM', dueDate = null }) => {
        const parsedDue = dueDate ? new Date(dueDate) : null;
        const task = await Task.create({
          userId: 'default-user',
          title,
          description,
          priority,
          dueDate: !isNaN(parsedDue) ? parsedDue : null,
          source: 'ai-agent'
        });
        return {
          id: task._id,
          title: task.title,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate
        };
      }
    });

    // 7. getTasks
    this.registerTool({
      name: 'getTasks',
      description: 'Retrieve current pending or completed tasks and reminders',
      permissionLevel: PERMISSION_LEVELS.READ_ONLY,
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] }
        }
      },
      execute: async ({ status = 'ALL' }) => {
        const query = { userId: 'default-user' };
        if (status && status !== 'ALL') {
          query.status = status;
        }
        const tasks = await Task.find(query).sort({ createdAt: -1 }).limit(20);
        return tasks.map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate
        }));
      }
    });

    // 8. saveMemory
    this.registerTool({
      name: 'saveMemory',
      description: 'Save a permanent fact, user preference, project detail, or important knowledge into long-term memory',
      permissionLevel: PERMISSION_LEVELS.LOW_RISK,
      parameters: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', description: 'The exact memory content to remember' },
          type: { type: 'string', enum: ['FACT', 'PREFERENCE', 'PROJECT', 'GOAL'], description: 'Category of memory' },
          importance: { type: 'number', description: 'Importance score from 1 to 10' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Descriptive keywords' }
        }
      },
      execute: async ({ content, type = 'FACT', importance = 6, tags = [] }) => {
        const memory = await Memory.create({
          userId: 'default-user',
          content,
          type,
          importance: Math.min(10, Math.max(1, importance)),
          tags
        });
        return { id: memory._id, content: memory.content, type: memory.type, importance: memory.importance };
      }
    });

    // 9. searchMemory
    this.registerTool({
      name: 'searchMemory',
      description: 'Search long-term user memories for stored preferences, facts, or instructions',
      permissionLevel: PERMISSION_LEVELS.READ_ONLY,
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', description: 'Keyword or concept to recall' }
        }
      },
      execute: async ({ query }) => {
        const regex = new RegExp(query, 'i');
        const memories = await Memory.find({
          userId: 'default-user',
          active: true,
          $or: [{ content: regex }, { tags: regex }]
        }).sort({ importance: -1 }).limit(5);

        return memories.map(m => ({
          id: m._id,
          type: m.type,
          content: m.content,
          importance: m.importance
        }));
      }
    });

    // 10. knowledgeSearch (RAG)
    this.registerTool({
      name: 'knowledgeSearch',
      description: 'Search through uploaded personal documents and knowledge base files using RAG retrieval',
      permissionLevel: PERMISSION_LEVELS.READ_ONLY,
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string', description: 'Question or concept to search within knowledge documents' }
        }
      },
      execute: async ({ query }) => {
        const regex = new RegExp(query.split(' ').filter(w => w.length > 2).join('|'), 'i');
        const chunks = await DocumentChunk.find({
          content: regex
        }).limit(4);

        if (chunks.length === 0) {
          return { found: false, message: 'No relevant documents found matching query in knowledge base.' };
        }

        return {
          found: true,
          chunks: chunks.map(c => ({
            content: c.content,
            metadata: c.metadata
          }))
        };
      }
    });

    // 11. summarizeContent
    this.registerTool({
      name: 'summarizeContent',
      description: 'Condense and summarize a long passage of text or raw data',
      permissionLevel: PERMISSION_LEVELS.READ_ONLY,
      parameters: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', description: 'Text to summarize' },
          maxLength: { type: 'string', enum: ['short', 'medium', 'detailed'] }
        }
      },
      execute: async ({ text, maxLength = 'medium' }) => {
        const sentences = text.split(/(?<=[.?!])\s+/);
        const count = maxLength === 'short' ? 2 : maxLength === 'detailed' ? 6 : 4;
        const summary = sentences.slice(0, count).join(' ');
        return { summary: summary || text.slice(0, 300) };
      }
    });

    // 12. generateDocument
    this.registerTool({
      name: 'generateDocument',
      description: 'Draft a structured document, formal email, cover letter, or article',
      permissionLevel: PERMISSION_LEVELS.LOW_RISK,
      parameters: {
        type: 'object',
        required: ['topic'],
        properties: {
          topic: { type: 'string', description: 'Subject or goal of the document' },
          format: { type: 'string', enum: ['email', 'letter', 'article', 'summary', 'post'] },
          tone: { type: 'string', enum: ['professional', 'friendly', 'persuasive', 'formal', 'casual'] }
        }
      },
      execute: async ({ topic, format = 'email', tone = 'professional' }) => {
        return {
          draftReady: true,
          topic,
          format,
          tone,
          template: `Subject: Regarding ${topic}\n\nDear recipient,\n\nI am writing to discuss ${topic} in a ${tone} tone.\n\nBest regards,\nUser`
        };
      }
    });
  }
}

export const toolRegistry = new ToolRegistry();
