import { OllamaProvider } from './OllamaProvider.js';
import { FallbackProvider } from './FallbackProvider.js';
import { config } from '../../config/index.js';

class AIService {
  constructor() {
    this.ollama = new OllamaProvider({
      baseUrl: config.ollama.baseUrl,
      defaultModel: config.ollama.defaultModel,
      embeddingModel: config.ollama.embeddingModel
    });
    this.fallback = new FallbackProvider();
    this.activeProvider = this.ollama;
  }

  async getHealthyProvider() {
    const health = await this.ollama.isHealthy();
    if (health.available) {
      this.activeProvider = this.ollama;
      return { provider: this.ollama, isOllama: true, health };
    }
    this.activeProvider = this.fallback;
    return { provider: this.fallback, isOllama: false, health };
  }

  async listModels() {
    const health = await this.ollama.isHealthy();
    if (health.available) {
      const models = await this.ollama.listModels();
      if (models.length > 0) return models;
    }
    return this.fallback.listModels();
  }

  async chatStream(options) {
    const { provider } = await this.getHealthyProvider();
    return provider.chatStream(options);
  }

  async embed(text) {
    const { provider } = await this.getHealthyProvider();
    return provider.embed(text);
  }

  async getHealthStatus() {
    return this.ollama.isHealthy();
  }
}

export const aiService = new AIService();
