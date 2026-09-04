import { aiService } from '../ai/index.js';
import { toolRegistry, PERMISSION_LEVELS } from '../tools/ToolRegistry.js';
import { memoryEngine } from '../memory/MemoryEngine.js';
import { Message } from '../../models/Message.js';
import { ToolExecution } from '../../models/ToolExecution.js';
import { Settings } from '../../models/Settings.js';

export class AgentOrchestrator {
  /**
   * Run the full agent loop with real-time SSE callback
   */
  static async run({
    conversationId,
    userMessage,
    userId = 'default-user',
    onEvent // (event: { type, data }) => void
  }) {
    const sendEvent = (type, data) => {
      if (onEvent) onEvent({ type, data });
    };

    try {
      // 1. Load User Settings & Persona
      let settings = await Settings.findOne({ userId });
      if (!settings) {
        settings = await Settings.create({ userId });
      }

      sendEvent('state_change', { state: 'THINKING', statusText: 'Analyzing intent and searching memory...' });

      // 2. Memory Retrieval
      let relevantMemories = [];
      if (settings.memoryEnabled) {
        relevantMemories = await memoryEngine.getRelevantMemories(userId, userMessage, 4);
        if (relevantMemories.length > 0) {
          sendEvent('memory_retrieved', {
            count: relevantMemories.length,
            memories: relevantMemories.map(m => m.content)
          });
        }
      }

      // 3. Context Assembly
      // Fetch recent conversation history
      const recentHistory = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(10);
      const formattedHistory = recentHistory.reverse().map(m => ({
        role: m.role,
        content: m.content
      }));

      // Construct system prompt with Persona, Memory, and Agent Rules
      let systemPrompt = `${settings.systemPrompt}\n\n` +
        `Current Persona: ${settings.personality}.\n` +
        `Response Style: ${settings.responseStyle}, Response Length: ${settings.responseLength}.\n` +
        `Current Local Time: ${new Date().toLocaleString()}.\n\n` +
        `CRITICAL AGENT RULES:\n` +
        `1. You are a real personal AI agent, not just a conversational bot. Intelligently decide when to use tools.\n` +
        `2. Do NOT execute tools unnecessarily. For basic questions, answer directly.\n` +
        `3. For recent events, live news, or real-time web data, use the 'webSearch' tool.\n` +
        `4. For calculations, use 'calculator'. For reminders or tasks, use 'createTask'.\n` +
        `5. Never claim you used a tool when you didn't, and never fabricate search sources.\n` +
        `6. BROWSER AUTOMATION: For commands like "Open YouTube and play Na Ready" or "Open Google and search X", use the 'browserAutomation' tool with an array of sequential steps (e.g. open -> search -> play).\n`;

      if (relevantMemories.length > 0) {
        systemPrompt += `\nRELEVANT USER LONG-TERM MEMORIES:\n` +
          relevantMemories.map(m => `- [${m.type}] ${m.content}`).join('\n') + `\n`;
      }

      const messagesForLLM = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: userMessage }
      ];

      // 4. Check available tools
      const tools = toolRegistry.getToolsForLLM();

      let toolExecutionRecords = [];
      let sourcesCollected = [];
      let llmResult = { content: '', toolCalls: [] };
      const userMessageLower = userMessage.toLowerCase();

      let isFastPath = false;

      // ═══════════════════════════════════════════════════════════════════════
      // FAST-PATH: Comprehensive YouTube Media Action Engine
      // Handles 30+ natural operations + multi-command combinations seamlessly
      // ═══════════════════════════════════════════════════════════════════════
      const parseSingleMediaAction = (text) => {
        const t = text.trim().toLowerCase();
        if (!t) return null;

        // 1. Status / Info
        if (
          t.includes('what song is playing') || t.includes('what video is this') ||
          t.includes('what is the title') || t.includes('how long is this video') ||
          t.includes('how much time is left') || t.includes('where am i in the video') ||
          t === 'video status' || t === 'song status' || t === 'status'
        ) {
          return { op: 'current_status', args: { operation: 'current_status' }, ack: 'Checking video status.' };
        }

        // 2. Restart / Beginning
        if (
          t.includes('start from the beginning') || t.includes('restart the video') ||
          t.includes('restart the song') || t.includes('play from beginning') ||
          t.includes('start the song from the beginning') || t.includes('play it from the start') ||
          t === 'restart' || t === 'from beginning' || t === 'start over'
        ) {
          return { op: 'restart', args: { operation: 'restart' }, ack: 'Restarting video from the beginning.' };
        }

        // 3. Mute / Unmute
        if (
          t === 'unmute' || t.includes('turn the sound on') || t.includes('turn on the sound') ||
          t.includes('enable sound') || t.includes('bring the sound back')
        ) {
          return { op: 'unmute', args: { operation: 'unmute' }, ack: 'Unmuting video.' };
        }
        if (
          t === 'mute' || t.includes('mute the video') || t.includes('mute the song') ||
          t.includes('turn the sound off') || t.includes('silence it') || t.includes('remove the sound')
        ) {
          return { op: 'mute', args: { operation: 'mute' }, ack: 'Muting video.' };
        }

        // 4. Exact Volume Set
        const setVolMatch = t.match(/(?:set volume to|set the sound to|volume to|set volume|volume)\s*(\d{1,3})\s*%?/);
        if (setVolMatch && !t.includes('up') && !t.includes('down') && !t.includes('increase') && !t.includes('decrease')) {
          const vol = parseInt(setVolMatch[1], 10);
          return { op: 'set_volume', args: { operation: 'set_volume', volume: vol }, ack: `Setting volume to ${vol}%.` };
        }

        // 5. Volume Up / Increase
        if (
          t.includes('increase') || t.includes('volume up') || t.includes('louder') ||
          t.includes('sound up') || t.includes('volume increase') || t.includes('turn up') ||
          t === 'louder' || t === 'make it louder'
        ) {
          return { op: 'volume_up', args: { operation: 'volume_up', volume: 0.2 }, ack: 'Increasing volume.' };
        }

        // 6. Volume Down / Decrease
        if (
          t.includes('decrease') || t.includes('volume down') || t.includes('quieter') ||
          t.includes('sound down') || t.includes('volume decrease') || t.includes('lower') ||
          t.includes('turn down') || t === 'make it quieter'
        ) {
          return { op: 'volume_down', args: { operation: 'volume_down', volume: 0.2 }, ack: 'Decreasing volume.' };
        }

        // 7. Fullscreen / Exit Fullscreen
        if (
          t.includes('exit fullscreen') || t.includes('close fullscreen') ||
          t.includes('leave fullscreen') || t.includes('normal screen') || t.includes('exit full screen')
        ) {
          return { op: 'exit_fullscreen', args: { operation: 'exit_fullscreen' }, ack: 'Exiting fullscreen.' };
        }
        if (
          t.includes('fullscreen') || t.includes('full screen') || t.includes('expand the video') ||
          t.includes('open fullscreen') || t.includes('make it fullscreen')
        ) {
          return { op: 'fullscreen', args: { operation: 'fullscreen' }, ack: 'Entering fullscreen.' };
        }

        // 8. Playback Speed
        const speedMatch = t.match(/(?:play at|set speed to|speed to|playback rate to|speed)\s*([\d\.]+)x?/);
        if (speedMatch) {
          const rate = parseFloat(speedMatch[1]);
          return { op: 'set_playback_rate', args: { operation: 'set_playback_rate', rate }, ack: `Setting playback speed to ${rate}x.` };
        }
        if (t.includes('make it faster') || t.includes('speed up the video') || t === 'speed up' || t === 'faster') {
          return { op: 'set_playback_rate', args: { operation: 'set_playback_rate', rate: 1.5 }, ack: 'Speeding up video to 1.5x.' };
        }
        if (t.includes('play slower') || t.includes('slow it down') || t === 'slow down' || t === 'slower') {
          return { op: 'set_playback_rate', args: { operation: 'set_playback_rate', rate: 0.75 }, ack: 'Slowing down video to 0.75x.' };
        }

        // 9. Captions / Subtitles
        if (
          t.includes('turn on subtitles') || t.includes('enable subtitles') ||
          t.includes('turn captions on') || t.includes('show captions') ||
          t === 'subtitles on' || t === 'captions on'
        ) {
          return { op: 'captions_on', args: { operation: 'captions_on' }, ack: 'Enabling subtitles.' };
        }
        if (
          t.includes('turn subtitles off') || t.includes('disable captions') ||
          t.includes('hide subtitles') || t.includes('disable subtitles') ||
          t === 'subtitles off' || t === 'captions off'
        ) {
          return { op: 'captions_off', args: { operation: 'captions_off' }, ack: 'Disabling subtitles.' };
        }

        // Word to number converter helper
        const wordToNum = (val) => {
          if (!val) return 10;
          const map = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'fifteen': 15, 'twenty': 20, 'thirty': 30, 'forty': 40,
            'fifty': 50, 'sixty': 60
          };
          return map[val] || parseInt(val, 10) || 10;
        };

        // 10. Seek to timestamp (e.g. "go to 1:30", "play from 2:15", "jump to 2 minutes 30 seconds")
        const timeColonMatch = t.match(/(?:go to|jump to|play from|start from|seek to)\s*(\d+):(\d+)/);
        if (timeColonMatch) {
          const secs = parseInt(timeColonMatch[1], 10) * 60 + parseInt(timeColonMatch[2], 10);
          return { op: 'seek_to', args: { operation: 'seek_to', seconds: secs }, ack: `Jumping to ${timeColonMatch[1]}:${timeColonMatch[2]}.` };
        }
        const timeWordMatch = t.match(/(?:go to|jump to|play from|start from|seek to)\s*(\d+)\s*(?:minutes?|mins?)(?:\s*(\d+)\s*(?:seconds?|secs?))?/);
        if (timeWordMatch) {
          const secs = parseInt(timeWordMatch[1], 10) * 60 + (timeWordMatch[2] ? parseInt(timeWordMatch[2], 10) : 0);
          return { op: 'seek_to', args: { operation: 'seek_to', seconds: secs }, ack: `Jumping to timestamp.` };
        }

        // 11. Seek Forward (e.g. "skip the 10 second", "skip 10 seconds", "forward 10s", "fast forward 20")
        if (t.includes('forward 1 minute') || t.includes('skip 1 minute') || t.includes('jump forward 1 minute')) {
          return { op: 'seek_forward', args: { operation: 'seek_forward', seconds: 60 }, ack: 'Skipping forward 1 minute.' };
        }
        const seekFwdRegex = /(?:fast forward|skip ahead|jump forward|move forward|go forward|seek forward|forward|skip)\s*(?:the)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty|fifty|sixty)?\s*(?:seconds?|secs?|s)?/;
        const fwdMatch = t.match(seekFwdRegex);
        if (fwdMatch && (t.includes('skip') || t.includes('forward') || t.includes('jump') || t.includes('fast')) && !t.includes('back') && !t.includes('song') && !t.includes('video') && !t.includes('next')) {
          const rawNum = fwdMatch[1];
          const secs = wordToNum(rawNum);
          return { op: 'seek_forward', args: { operation: 'seek_forward', seconds: secs }, ack: `Skipped forward ${secs} seconds.` };
        }
        const reverseFwdMatch = t.match(/(\d+|ten|twenty|thirty)\s*(?:seconds?|secs?|s)?\s*(?:skip|forward)/);
        if (reverseFwdMatch && !t.includes('back')) {
          const secs = wordToNum(reverseFwdMatch[1]);
          return { op: 'seek_forward', args: { operation: 'seek_forward', seconds: secs }, ack: `Skipped forward ${secs} seconds.` };
        }

        // 12. Seek Backward (e.g. "rewind 10 seconds", "go back 10 seconds", "skip back 20s")
        if (t.includes('rewind 1 minute') || t.includes('jump back 1 minute') || t.includes('go back 1 minute')) {
          return { op: 'seek_backward', args: { operation: 'seek_backward', seconds: 60 }, ack: 'Going back 1 minute.' };
        }
        const seekBwdRegex = /(?:rewind|take me back|jump back|move backward|go backward|skip back|seek back|backward|back)\s*(?:the)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty|fifty|sixty)?\s*(?:seconds?|secs?|s)?/;
        const bwdMatch = t.match(seekBwdRegex);
        if (bwdMatch && !t.includes('page') && !t.includes('previous') && !t.includes('song') && !t.includes('video')) {
          const rawNum = bwdMatch[1];
          const secs = wordToNum(rawNum);
          return { op: 'seek_backward', args: { operation: 'seek_backward', seconds: secs }, ack: `Going back ${secs} seconds.` };
        }
        const reverseBwdMatch = t.match(/(\d+|ten|twenty|thirty)\s*(?:seconds?|secs?|s)?\s*(?:rewind|back|backward)/);
        if (reverseBwdMatch && !t.includes('page')) {
          const secs = wordToNum(reverseBwdMatch[1]);
          return { op: 'seek_backward', args: { operation: 'seek_backward', seconds: secs }, ack: `Going back ${secs} seconds.` };
        }

        // 13. Next Video / Song
        if (
          t === 'next' || t === 'next song' || t === 'play next' || t === 'next video' ||
          t.includes('next song') || t.includes('next video') || t.includes('play the next') ||
          t.includes('go to the next') || t.includes('play next song') || t.includes('play another song') ||
          t.includes('move to the next') || t.includes('skip to the next') || t === 'next one'
        ) {
          return { op: 'next', args: { operation: 'next' }, ack: 'Playing next video.' };
        }

        // 14. Previous Video / Song
        if (
          t === 'previous' || t === 'previous song' || t === 'play previous' || t === 'previous video' ||
          t.includes('previous song') || t.includes('previous video') || t.includes('play the previous') ||
          t.includes('go to the previous') || t.includes('play the before song') || t.includes('before song') ||
          t.includes('go back to the previous video') || t.includes('go to previous') || t === 'previous one'
        ) {
          return { op: 'previous', args: { operation: 'previous' }, ack: 'Going back to previous video.' };
        }

        // 15. Pause / Stop
        if (
          t === 'pause' || t === 'pause it' || t === 'pause video' ||
          t.includes('pause the song') || t.includes('pause the video') ||
          t.includes('stop the song') || t.includes('stop playing') || t.includes('hold the video')
        ) {
          return { op: 'pause', args: { operation: 'pause' }, ack: 'Paused.' };
        }

        // 16. Resume / Play
        if (
          t === 'resume' || t === 'resume it' || t === 'continue' || t === 'continue playing' ||
          t.includes('resume playing') || t.includes('resume the song') || t.includes('resume the video') ||
          t.includes('continue the song') || t.includes('start again') || t.includes('play again') ||
          t === 'start playing' || t === 'start the song' || t === 'start the video' ||
          t === 'play this' || (t === 'play' && !t.includes('youtube') && !t.includes('google')) ||
          t === 'play it'
        ) {
          return { op: 'resume', args: { operation: 'resume' }, ack: 'Resumed.' };
        }

        // 17. Scroll / Comments
        if (t.includes('scroll to comments') || t.includes('show comments') || t === 'comments') {
          return { op: 'scroll_to_comments', args: { operation: 'scroll_to_comments' }, ack: 'Scrolling to comments.' };
        }
        if (t.includes('scroll down') || t.includes('show more videos')) {
          return { op: 'scroll_down', args: { operation: 'scroll_down', pixels: 400 }, ack: 'Scrolling down.' };
        }
        if (t.includes('scroll up')) {
          return { op: 'scroll_up', args: { operation: 'scroll_up', pixels: 400 }, ack: 'Scrolling up.' };
        }

        // 18. Like / Unlike / Subscribe / Unsubscribe
        if (t.includes('like this video') || t.includes('like the song') || t.includes('like the video') || t === 'like') {
          return { op: 'like', args: { operation: 'like' }, ack: 'Liking video.' };
        }
        if (t.includes('unlike') || t.includes('remove like')) {
          return { op: 'unlike', args: { operation: 'unlike' }, ack: 'Removing like.' };
        }
        if (t.includes('subscribe to this channel') || t.includes('subscribe channel') || t === 'subscribe') {
          return { op: 'subscribe', args: { operation: 'subscribe' }, ack: 'Subscribing to channel.' };
        }
        if (t.includes('unsubscribe')) {
          return { op: 'unsubscribe', args: { operation: 'unsubscribe' }, ack: 'Unsubscribing from channel.' };
        }

        // 19. Browser Back / Forward
        if (t.includes('go to the previous page') || t.includes('previous page') || t === 'browser back' || t === 'go back') {
          return { op: 'browser_back', args: { operation: 'browser_back' }, ack: 'Navigating back.' };
        }
        if (t.includes('go forward') || t === 'browser forward') {
          return { op: 'browser_forward', args: { operation: 'browser_forward' }, ack: 'Navigating forward.' };
        }

        return null;
      };

      // Check compound commands (e.g. "pause the song and go back 10 seconds")
      const subSegments = userMessageLower.split(/\s+(?:and|then)\s+/);
      const matchedActions = subSegments.map(s => parseSingleMediaAction(s)).filter(Boolean);

      if (matchedActions.length > 0 && matchedActions.length === subSegments.length) {
        // All subparts matched valid media actions!
        isFastPath = true;
        sendEvent('state_change', { state: 'THINKING', statusText: 'Executing media commands...' });
        llmResult.toolCalls = matchedActions.map(a => ({
          name: 'youtubeControl',
          arguments: a.args
        }));
        const combinedAck = matchedActions.map(a => a.ack).join(' ');
        sendEvent('token', { token: combinedAck });
        llmResult.content = combinedAck;

      } else if ((userMessageLower.includes('google') || userMessageLower.includes('chrome')) && !userMessageLower.includes('youtube')) {
        // ── GOOGLE SEARCH ─────────────────────────────────────────────────────
        isFastPath = true;
        sendEvent('state_change', { state: 'THINKING', statusText: 'Opening Google...' });
        let googleQuery = userMessage;
        ['open your', 'open', 'google', 'chrome', 'search', 'ask', 'what is mean by', 'what is'].forEach(phrase => {
          googleQuery = googleQuery.replace(new RegExp(phrase, 'gi'), '');
        });
        googleQuery = googleQuery.trim();
        llmResult.toolCalls = [{
          name: 'browserAutomation',
          arguments: {
            steps: [
              { action: 'open', target: 'google' },
              { action: 'search', query: googleQuery || userMessage }
            ]
          }
        }];
        const googleAck = `Searching Google for: ${googleQuery}`;
        sendEvent('token', { token: googleAck });
        llmResult.content = googleAck;

      } else if (userMessageLower.includes('youtube') && (userMessageLower.includes('play') || userMessageLower.includes('open') || userMessageLower.includes('search'))) {
        // ── OPEN YOUTUBE AND PLAY ─────────────────────────────────────────────
        isFastPath = true;
        sendEvent('state_change', { state: 'THINKING', statusText: 'Opening YouTube...' });
        let query = userMessage
          .replace(/open youtube and play/i, '')
          .replace(/open youtube/i, '')
          .replace(/play on youtube/i, '')
          .replace(/search youtube for/i, '')
          .replace(/youtube/i, '')
          .replace(/^(play|open|search)\s+/i, '')
          .trim();
        llmResult.toolCalls = [{
          name: 'browserAutomation',
          arguments: {
            steps: [
              { action: 'open', target: 'youtube' },
              { action: 'search', query: query || 'trending' },
              { action: 'play' }
            ]
          }
        }];
        const ytAck = `Opening YouTube — searching for: ${query || 'trending'}`;
        sendEvent('token', { token: ytAck });
        llmResult.content = ytAck;

      } else {
        sendEvent('state_change', { state: 'THINKING', statusText: 'Warming up local AI model (this may take 15-30s)...' });

        // Hook for streaming tokens and tool calls
        llmResult = await aiService.chatStream({
          messages: messagesForLLM,
          tools,
          model: settings.selectedModel,
          onToken: (token) => {
            sendEvent('token', { token });
          },
          onToolCall: async (toolCall) => {
            sendEvent('tool_call_detected', { toolName: toolCall.name, args: toolCall.arguments });
          }
        });
      }

      let finalResponseContent = llmResult.content || '';

      // 5. If Tool Calls were selected by the model
      if (llmResult.toolCalls && llmResult.toolCalls.length > 0) {
        for (const tc of llmResult.toolCalls) {
          const toolDef = toolRegistry.getTool(tc.name);
          if (!toolDef) continue;

          // Check Avatar State based on Tool
          if (tc.name === 'webSearch') {
            sendEvent('state_change', { state: 'SEARCHING', statusText: `Searching web for "${tc.arguments?.query || ''}"` });
          } else {
            sendEvent('state_change', { state: 'EXECUTING', statusText: `Executing tool ${tc.name}...` });
          }

          sendEvent('tool_start', {
            toolName: tc.name,
            input: tc.arguments,
            permissionLevel: toolDef.permissionLevel
          });

          // Check if tool requires confirmation
          if (toolDef.permissionLevel === PERMISSION_LEVELS.REQUIRES_CONFIRMATION) {
            sendEvent('confirmation_required', {
              toolName: tc.name,
              input: tc.arguments,
              description: `Action requires your approval: ${tc.name}`
            });
          }

          // Execute tool
          const onProgress = (msg) => {
            sendEvent('state_change', { state: 'EXECUTING', statusText: msg });
          };
          const executionResult = await toolRegistry.executeTool(tc.name, tc.arguments, { conversationId, userId }, onProgress);

          // Record in DB
          const execLog = await ToolExecution.create({
            conversationId,
            toolName: tc.name,
            input: tc.arguments,
            outputSummary: executionResult.success ? JSON.stringify(executionResult.data).slice(0, 300) : executionResult.error,
            status: executionResult.success ? 'COMPLETED' : 'FAILED',
            permissionLevel: toolDef.permissionLevel,
            duration: executionResult.duration,
            error: executionResult.error || null
          });

          toolExecutionRecords.push({
            toolName: tc.name,
            input: tc.arguments,
            output: executionResult.data,
            status: executionResult.success ? 'completed' : 'failed',
            duration: executionResult.duration
          });

          sendEvent('tool_end', {
            toolName: tc.name,
            success: executionResult.success,
            data: executionResult.data,
            duration: executionResult.duration
          });

          // Extract sources if tool was webSearch
          if (tc.name === 'webSearch' && executionResult.data?.results) {
            sourcesCollected = executionResult.data.results;
            sendEvent('sources_updated', { sources: sourcesCollected });
          }

          // Synthesize response ONLY if it's NOT a fast-path command
          if (!isFastPath && !executionResult.success) {
            sendEvent('state_change', { state: 'THINKING', statusText: 'Synthesizing response with tool results...' });
            
            const toolOutputContent = executionResult.success
              ? JSON.stringify(executionResult.data, null, 2)
              : `TOOL FAILED. Error: ${executionResult.error || JSON.stringify(executionResult.data)}`;

            const synthesisPrompt = [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
              {
                role: 'tool',
                content: `Tool ${tc.name} returned:\n${toolOutputContent}`
              },
              {
                role: 'user',
                content: executionResult.success
                  ? 'Please synthesize a clear, helpful response to the user confirming the tool execution and summarizing the result.'
                  : 'The tool execution failed. Explain to the user exactly what failed based on the error above. Do NOT claim you will attempt it again.'
              }
            ];

            let synthesisContent = '';
            await aiService.chatStream({
              messages: synthesisPrompt,
              model: settings.selectedModel,
              onToken: (token) => {
                synthesisContent += token;
                sendEvent('token', { token });
              }
            });
            if (synthesisContent) {
              finalResponseContent = synthesisContent;
            }
          }
        }
      }

      // 6. Memory Extraction Pipeline
      if (settings.memoryEnabled) {
        const newMemory = await memoryEngine.extractAndSaveMemory(userId, userMessage, conversationId);
        if (newMemory) {
          sendEvent('memory_created', {
            content: newMemory.content,
            type: newMemory.type,
            importance: newMemory.importance
          });
        }
      }

      // 7. Save Assistant Message in DB
      const assistantMessage = await Message.create({
        conversationId,
        role: 'assistant',
        content: finalResponseContent,
        toolCalls: toolExecutionRecords,
        sources: sourcesCollected,
        memoriesUsed: relevantMemories.map(m => m.content),
        aiState: 'IDLE'
      });

      sendEvent('state_change', { state: 'SUCCESS', statusText: 'Response generated' });
      setTimeout(() => {
        sendEvent('state_change', { state: 'IDLE', statusText: 'Ready' });
      }, 1500);

      sendEvent('complete', {
        messageId: assistantMessage._id,
        content: finalResponseContent,
        sources: sourcesCollected,
        toolCalls: toolExecutionRecords
      });

      return assistantMessage;
    } catch (error) {
      console.error('[AgentOrchestrator] Error:', error);
      sendEvent('state_change', { state: 'ERROR', statusText: error.message });
      sendEvent('error', { error: error.message });
      throw error;
    }
  }
}
