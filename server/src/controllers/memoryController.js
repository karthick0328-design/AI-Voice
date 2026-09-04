import { Memory } from '../models/Memory.js';

export const getMemories = async (req, res) => {
  try {
    const { search, type } = req.query;
    const filter = { userId: 'default-user' };

    if (type && type !== 'ALL') {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { content: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const memories = await Memory.find(filter).sort({ importance: -1, createdAt: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMemory = async (req, res) => {
  try {
    const { content, type, importance, tags } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const memory = await Memory.create({
      userId: 'default-user',
      content,
      type: type || 'FACT',
      importance: Number(importance) || 5,
      tags: Array.isArray(tags) ? tags : []
    });
    res.status(201).json(memory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type, importance, tags, active } = req.body;
    const updated = await Memory.findByIdAndUpdate(
      id,
      {
        ...(content && { content }),
        ...(type && { type }),
        ...(importance !== undefined && { importance: Number(importance) }),
        ...(tags && { tags }),
        ...(active !== undefined && { active })
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;
    await Memory.findByIdAndDelete(id);
    res.json({ success: true, message: 'Memory deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearAllMemories = async (req, res) => {
  try {
    await Memory.deleteMany({ userId: 'default-user' });
    res.json({ success: true, message: 'All memories cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
