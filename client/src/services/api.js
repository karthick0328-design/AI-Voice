import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiService = {
  // Conversations
  getConversations: (params) => api.get('/conversations', { params }),
  getConversationMessages: (id) => api.get(`/conversations/${id}/messages`),
  updateConversation: (id, data) => api.patch(`/conversations/${id}`, data),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),

  // Memories
  getMemories: (params) => api.get('/memories', { params }),
  createMemory: (data) => api.post('/memories', data),
  updateMemory: (id, data) => api.patch(`/memories/${id}`, data),
  deleteMemory: (id) => api.delete(`/memories/${id}`),
  clearMemories: () => api.delete('/memories'),

  // Tasks
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  // Automations
  getAutomations: () => api.get('/automations'),
  createAutomation: (data) => api.post('/automations', data),
  runAutomation: (id) => api.post(`/automations/${id}/run`),
  toggleAutomation: (id) => api.patch(`/automations/${id}/toggle`),
  deleteAutomation: (id) => api.delete(`/automations/${id}`),

  // Documents
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: (params) => api.get('/documents', { params }),
  searchDocuments: (query) => api.post('/documents/search', { query }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),

  // Models & Health
  getModels: () => api.get('/models'),
  getHealth: () => api.get('/health'),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),

  // Tools
  getTools: () => api.get('/tools'),

  /**
   * Stream Chat response using fetch ReadableStream
   */
  streamChat: async ({ conversationId, message, onEvent, signal }) => {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message }),
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop(); // keep last chunk

      for (const line of lines) {
        if (!line.trim()) continue;
        const eventMatch = line.match(/^event:\s*(.+)$/m);
        const dataMatch = line.match(/^data:\s*(.+)$/m);

        if (eventMatch && dataMatch) {
          const eventType = eventMatch[1].trim();
          
          let data;
          try {
            data = JSON.parse(dataMatch[1].trim());
          } catch (e) {
            console.error('Failed to parse SSE data:', dataMatch[1], e);
            continue;
          }

          if (onEvent) onEvent(eventType, data);
        }
      }
    }
  }
};
