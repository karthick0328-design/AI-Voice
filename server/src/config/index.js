import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_personal_agent',
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    defaultModel: process.env.DEFAULT_MODEL || 'llama3.1:8b',
    embeddingModel: process.env.EMBEDDING_MODEL || 'nomic-embed-text'
  },
  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS !== 'false'
  },
  search: {
    tavilyApiKey: process.env.TAVILY_API_KEY || '',
    serpApiKey: process.env.SERPAPI_API_KEY || ''
  }
};
