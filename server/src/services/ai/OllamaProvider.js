import axios from 'axios';
import { AIProvider } from './AIProvider.js';

export class OllamaProvider extends AIProvider {
  constructor(options = {}) {
    super('ollama');
    this.baseUrl = options.baseUrl || 'http://127.0.0.1:11434';
    this.defaultModel = options.defaultModel || 'llama3.1:8b';
    this.embeddingModel = options.embeddingModel || 'nomic-embed-text';
  }

  async isHealthy() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 3000 });
      return {
        available: true,
        message: 'Ollama is online and responsive',
        modelCount: response.data.models ? response.data.models.length : 0
      };
    } catch (error) {
      return {
        available: false,
        message: 'Ollama is not running or unreachable at ' + this.baseUrl,
        error: error.message
      };
    }
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 4000 });
      const models = (response.data.models || []).map(m => ({
        id: m.name,
        name: m.name,
        size: m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : 'Unknown',
        modifiedAt: m.modified_at
      }));
      return models;
    } catch (error) {
      console.warn('[OllamaProvider] Failed to list models:', error.message);
      return [];
    }
  }

  async chatStream({ messages, tools = [], model, temperature = 0.7, onToken, onToolCall }) {
    const selectedModel = model || this.defaultModel;
    
    // Prepare Ollama chat request
    const payload = {
      model: selectedModel,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content || ''
      })),
      stream: true,
      options: {
        temperature
      }
    };

    // Include native tools if provided
    if (tools && tools.length > 0) {
      payload.tools = tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters || { type: 'object', properties: {} }
        }
      }));
    }

    try {
      const response = await axios.post(`${this.baseUrl}/api/chat`, payload, {
        responseType: 'stream',
        timeout: 300000 // 5 minutes for slow CPU prompt evaluation
      });

      let fullContent = '';
      const toolCalls = [];

      return new Promise((resolve, reject) => {
        let buffer = '';

        response.data.on('data', (chunk) => {
          buffer += chunk.toString('utf-8');
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep last incomplete line

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.message) {
                // Token chunk
                if (parsed.message.content) {
                  fullContent += parsed.message.content;
                  if (onToken) onToken(parsed.message.content);
                }

                // Native tool calls if supported by model
                if (parsed.message.tool_calls) {
                  for (const tc of parsed.message.tool_calls) {
                    const toolObj = {
                      name: tc.function?.name,
                      arguments: tc.function?.arguments || {}
                    };
                    toolCalls.push(toolObj);
                    if (onToolCall) onToolCall(toolObj);
                  }
                }
              }

              if (parsed.done) {
                resolve({
                  content: fullContent,
                  toolCalls: toolCalls.length > 0 ? toolCalls : null,
                  tokens: {
                    prompt: parsed.prompt_eval_count || 0,
                    completion: parsed.eval_count || 0,
                    total: (parsed.prompt_eval_count || 0) + (parsed.eval_count || 0)
                  }
                });
              }
            } catch (err) {
              console.error('[OllamaProvider] Stream parse error:', err.message);
            }
          }
        });

        response.data.on('end', () => {
          resolve({
            content: fullContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : null
          });
        });

        response.data.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('connect ECONNREFUSED')) {
        throw new Error('AI model is unavailable. Please make sure Ollama is running at ' + this.baseUrl);
      }
      throw error;
    }
  }

  async embed(text) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model: this.embeddingModel,
        prompt: text
      }, { timeout: 15000 });
      return response.data.embedding || [];
    } catch (error) {
      console.warn('[OllamaProvider] Embedding error:', error.message);
      return [];
    }
  }
}
