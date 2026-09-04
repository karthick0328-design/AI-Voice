/**
 * Abstract AIProvider interface
 */
export class AIProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Health check to see if AI provider is available
   * @returns {Promise<{ available: boolean, message?: string }>}
   */
  async isHealthy() {
    throw new Error('Method isHealthy() must be implemented');
  }

  /**
   * List available models
   * @returns {Promise<Array<{ id: string, name: string, size?: string }>>}
   */
  async listModels() {
    throw new Error('Method listModels() must be implemented');
  }

  /**
   * Stream a chat response
   * @param {Object} options
   * @param {Array} options.messages
   * @param {Array} [options.tools]
   * @param {string} [options.model]
   * @param {number} [options.temperature]
   * @param {Function} [options.onToken] - (token: string) => void
   * @param {Function} [options.onToolCall] - (toolCall: Object) => void
   * @returns {Promise<{ content: string, toolCalls?: Array, tokens?: Object }>}
   */
  async chatStream(options) {
    throw new Error('Method chatStream() must be implemented');
  }

  /**
   * Generate text embeddings
   * @param {string} text
   * @returns {Promise<Array<number>>}
   */
  async embed(text) {
    throw new Error('Method embed() must be implemented');
  }
}
