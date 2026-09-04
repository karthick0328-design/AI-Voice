import { Settings } from '../models/Settings.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: 'default-user' });
    if (!settings) {
      settings = await Settings.create({ userId: 'default-user' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    let settings = await Settings.findOneAndUpdate(
      { userId: 'default-user' },
      updates,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
