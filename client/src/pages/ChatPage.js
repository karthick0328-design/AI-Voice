import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageItem } from '../components/chat/MessageItem.js';
import { StreamingMessage } from '../components/chat/StreamingMessage.js';
import { ChatInput } from '../components/chat/ChatInput.js';
import { ConfirmationModal } from '../components/chat/ConfirmationModal.js';
import { apiService } from '../services/api.js';
import { useAgent } from '../context/AgentContext.js';
import { Bot, Sparkles } from 'lucide-react';

export function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentConversationId,
    setCurrentConversationId,
    setAiState,
    setStatusText,
    settings,
    speakMessage,
    pendingConfirmation,
    setPendingConfirmation
  } = useAgent();

  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingTools, setStreamingTools] = useState([]);
  const [streamingSources, setStreamingSources] = useState([]);
  const [streamStatus, setStreamStatus] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Sync conversation ID from route
  useEffect(() => {
    if (id && id !== currentConversationId) {
      setCurrentConversationId(id);
      loadConversationMessages(id);
    } else if (!id) {
      setMessages([]);
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, streamingTools]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationMessages = async (convId) => {
    try {
      const res = await apiService.getConversationMessages(convId);
      setMessages(res.data || []);
    } catch (err) {
      console.warn('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (userText) => {
    if (!userText.trim() || isStreaming) return;

    // Add optimistic user message
    const tempUserMsg = {
      _id: 'temp-' + Date.now(),
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // Reset streaming states
    setStreamingContent('');
    setStreamingTools([]);
    setStreamingSources([]);
    setIsStreaming(true);
    setAiState('THINKING');
    setStatusText('Analyzing intent & context...');

    abortControllerRef.current = new AbortController();

    let convIdToUse = id || currentConversationId || 'new';

    try {
      await apiService.streamChat({
        conversationId: convIdToUse,
        message: userText,
        signal: abortControllerRef.current.signal,
        onEvent: (event, data) => {
          switch (event) {
            case 'conversation_created':
              setCurrentConversationId(data.conversationId);
              navigate(`/chat/${data.conversationId}`, { replace: true });
              break;

            case 'state_change':
              setAiState(data.state);
              setStatusText(data.statusText);
              setStreamStatus(data.statusText);
              break;

            case 'token':
              setStreamingContent(prev => prev + data.token);
              break;

            case 'tool_start':
              setStreamingTools(prev => [
                ...prev,
                { toolName: data.toolName, input: data.input, status: 'running' }
              ]);
              break;

            case 'tool_end':
              setStreamingTools(prev =>
                prev.map(t =>
                  t.toolName === data.toolName
                    ? { ...t, status: data.success ? 'completed' : 'failed', output: data.data, duration: data.duration }
                    : t
                )
              );
              break;

            case 'sources_updated':
              setStreamingSources(data.sources || []);
              break;

            case 'confirmation_required':
              setPendingConfirmation({
                toolName: data.toolName,
                input: data.input,
                description: data.description
              });
              break;

            case 'complete':
              // Append final assistant message
              setMessages(prev => [
                ...prev,
                {
                  _id: data.messageId || 'msg-' + Date.now(),
                  role: 'assistant',
                  content: data.content,
                  toolCalls: data.toolCalls || [],
                  sources: data.sources || [],
                  createdAt: new Date().toISOString()
                }
              ]);
              setStreamingContent('');
              setStreamingTools([]);
              setStreamingSources([]);
              setIsStreaming(false);

              // Auto-speak if enabled
              if (settings.autoSpeak && data.content) {
                speakMessage(data.content);
              }
              break;

            case 'error':
              console.error('Agent error event:', data.error);
              setStreamStatus(`Error: ${data.error}`);
              setIsStreaming(false);
              setAiState('ERROR');
              break;

            default:
              break;
          }
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Chat stream failed:', err);
        setAiState('ERROR');
        setStatusText(err.message || 'Stream failed');
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setAiState('IDLE');
      setStatusText('Generation stopped');
    }
  };

  const handleApproveConfirmation = () => {
    setPendingConfirmation(null);
    setStatusText('Action approved by user');
  };

  const handleRejectConfirmation = () => {
    setPendingConfirmation(null);
    setStatusText('Action rejected by user');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black shadow-2xl shadow-cyan-500/20">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Welcome to Aether AI Agent</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  I can remember your preferences, search the web, execute browser automation, create tasks, and manage multi-step workflows.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Powered by Local Ollama ({settings.selectedModel || 'llama3.1:8b'})</span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageItem key={msg._id || idx} message={msg} />
              ))}

              {/* Real-time Streaming Response Item */}
              {isStreaming && (
                <StreamingMessage
                  content={streamingContent}
                  tools={streamingTools}
                  sources={streamingSources}
                  statusText={streamStatus}
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        confirmation={pendingConfirmation}
        onApprove={handleApproveConfirmation}
        onReject={handleRejectConfirmation}
      />

      {/* Floating Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isStreaming={isStreaming}
        onStopStream={handleStopStream}
      />
    </div>
  );
}
