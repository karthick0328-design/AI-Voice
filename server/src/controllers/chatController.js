import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { AgentOrchestrator } from '../services/agent/AgentOrchestrator.js';

export const handleChatStream = async (req, res) => {
  console.log('[chatController] Received request:', req.body.message);
  const { conversationId: rawConvId, message: userText, userId = 'default-user' } = req.body;

  if (!userText || !userText.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // Setup Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders(); // Force headers to be sent immediately

  const sendSSE = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // 1. Get or create conversation
    let conversation;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(rawConvId);
    if (rawConvId && isValidObjectId) {
      conversation = await Conversation.findById(rawConvId);
    }

    if (!conversation) {
      // Auto-generate title from first 5 words of user message
      const title = userText.split(' ').slice(0, 5).join(' ') || 'New Chat';
      conversation = await Conversation.create({
        userId,
        title
      });
      sendSSE('conversation_created', { conversationId: conversation._id, title });
    }

    // 2. Save user message to database
    const savedUserMsg = await Message.create({
      conversationId: conversation._id,
      role: 'user',
      content: userText
    });

    sendSSE('user_message_saved', { messageId: savedUserMsg._id });

    // 3. Run Agent Orchestrator with SSE streaming
    await AgentOrchestrator.run({
      conversationId: conversation._id,
      userMessage: userText,
      userId,
      onEvent: ({ type, data }) => {
        sendSSE(type, data);
      }
    });

    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (error) {
    console.error('[chatController] Stream error:', error);
    sendSSE('error', { message: error.message });
    res.end();
  }
};

export const handleChatSync = async (req, res) => {
  console.log('[chatController] Sync Received request:', req.body.message);
  const { sessionId, message: userText } = req.body;

  if (!userText || !userText.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    let conversation;
    let title = userText.split(' ').slice(0, 5).join(' ');
    // Use sessionId as a marker, or create a conversation if none exists
    const convs = await Conversation.find({ title: sessionId || title });
    if (convs.length > 0) {
      conversation = convs[0];
    } else {
      conversation = await Conversation.create({
        userId: 'default-user',
        title: sessionId || title
      });
    }

    await Message.create({
      conversationId: conversation._id,
      role: 'user',
      content: userText
    });

    let fullResponse = '';
    await AgentOrchestrator.run({
      conversationId: conversation._id,
      userMessage: userText,
      userId: 'default-user',
      onEvent: ({ type, data }) => {
        if (type === 'token') {
          fullResponse += data.token;
        } else if (type === 'state_change' && data.statusText) {
          console.log('[Orchestrator]', data.statusText);
        }
      }
    });

    res.json({ aiResponse: fullResponse.trim() });
  } catch (error) {
    console.error('[chatController] Sync error:', error);
    res.status(500).json({ error: error.message });
  }
};
