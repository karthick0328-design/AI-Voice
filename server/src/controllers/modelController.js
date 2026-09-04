import { aiService } from '../services/ai/index.js';

export const getModels = async (req, res) => {
  try {
    const models = await aiService.listModels();
    const health = await aiService.getHealthStatus();
    res.json({
      models,
      health,
      activeProvider: aiService.activeProvider.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkHealth = async (req, res) => {
  try {
    const health = await aiService.getHealthStatus();
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
