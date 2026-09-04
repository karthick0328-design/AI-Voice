import React, { useState } from 'react';
import { PenTool, Sparkles, Copy, Check, Save, RefreshCw, Send } from 'lucide-react';
import { apiService } from '../services/api.js';
import { useAgent } from '../context/AgentContext.js';

export function ContentGeneratorPage() {
  const { speakMessage } = useAgent();
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('Email');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const formats = ['Email', 'LinkedIn Post', 'Instagram Caption', 'Executive Summary', 'Cover Letter', 'Article'];
  const tones = ['Professional', 'Friendly', 'Casual', 'Formal', 'Persuasive'];
  const lengths = ['Short', 'Medium', 'Long'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent('');

    const prompt = `Write a ${tone.toLowerCase()} ${format.toLowerCase()} about: ${topic}. Length: ${length.toLowerCase()}. Make it structured and ready to send.`;

    try {
      let resultText = '';
      await apiService.streamChat({
        conversationId: 'content-studio',
        message: prompt,
        onEvent: (event, data) => {
          if (event === 'token') {
            resultText += data.token;
            setGeneratedContent(prev => prev + data.token);
          } else if (event === 'complete') {
            setGeneratedContent(data.content);
          }
        }
      });
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToTask = async () => {
    if (!generatedContent) return;
    try {
      await apiService.createTask({
        title: `Draft: ${format} - ${topic.slice(0, 30)}`,
        description: generatedContent,
        category: 'Content'
      });
      alert('Content saved as a task/draft!');
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
          <PenTool className="w-4 h-4" />
          <span>CONTENT STUDIO WORKSPACE</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Autonomous Content Studio</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate high-impact emails, cover letters, articles, and social media posts with customizable tone and length.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleGenerate} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Prompt / Topic</label>
              <textarea
                required
                rows={4}
                placeholder="e.g. Follow-up email to venture partner regarding AI operating system demo and Q3 roadmap..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/40"
              />
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Format</label>
              <div className="grid grid-cols-2 gap-1.5">
                {formats.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-left truncate ${
                      format === f
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-dark-950 text-slate-400 border border-white/5 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Tone</label>
              <div className="flex flex-wrap gap-1.5">
                {tones.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      tone === t
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-dark-950 text-slate-400 border border-white/5 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Length</label>
              <div className="flex space-x-2">
                {lengths.map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      length === l
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-dark-950 text-slate-400 border border-white/5 hover:text-slate-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold text-xs hover:from-amber-300 hover:to-orange-400 disabled:opacity-40 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Drafting Content...' : 'Generate Content'}</span>
            </button>
          </form>
        </div>

        {/* Output Editor Column */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[420px]">
          <div className="glass-panel flex-1 rounded-2xl border border-white/10 p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-mono text-slate-300">GENERATED OUTPUT</span>
              {generatedContent && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-dark-950 border border-white/10 hover:border-cyan-400 text-xs font-mono text-slate-300 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleSaveToTask}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-dark-950 border border-white/10 hover:border-emerald-400 text-xs font-mono text-slate-300 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>
                </div>
              )}
            </div>

            <textarea
              value={generatedContent}
              onChange={e => setGeneratedContent(e.target.value)}
              placeholder="Your generated content will appear here in real-time. You can freely edit the text directly before copying or saving."
              className="flex-1 w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed min-h-[300px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
