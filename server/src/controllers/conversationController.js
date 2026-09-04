import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export const getConversations = async (req, res) => {
  try {
    const { search, archived } = req.query;
    const filter = { userId: 'default-user' };
    
    if (archived !== undefined) {
      filter.archived = archived === 'true';
    } else {
      filter.archived = false;
    }

    if (search) {
      filter.title = new RegExp(search, 'i');
    }

    const conversations = await Conversation.find(filter).sort({ pinned: -1, updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, pinned, archived } = req.body;
    const updated = await Conversation.findByIdAndUpdate(
      id,
      { ...(title && { title }), ...(pinned !== undefined && { pinned }), ...(archived !== undefined && { archived }) },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await Conversation.findByIdAndDelete(id);
    await Message.deleteMany({ conversationId: id });
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
