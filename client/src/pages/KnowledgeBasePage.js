import React, { useState, useEffect } from 'react';
import { FolderArchive, Upload, Search, FileText, Trash2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { apiService } from '../services/api.js';

export function KnowledgeBasePage() {
  const [documents, setDocuments] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Work Documents');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [category]);

  const loadDocuments = async () => {
    try {
      const res = await apiService.getDocuments({ category });
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', uploadCategory);

    try {
      await apiService.uploadDocument(formData);
      setSelectedFile(null);
      loadDocuments();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteDocument(id);
      loadDocuments();
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  const handleTestSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await apiService.searchDocuments(searchQuery);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const categories = ['ALL', 'Study Material', 'Work Documents', 'Project Documentation', 'Personal Notes', 'General'];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <FolderArchive className="w-4 h-4" />
          <span>LOCAL RAG KNOWLEDGE SYSTEM</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload PDF, Markdown, and TXT files for autonomous semantic chunking and RAG knowledge retrieval.
        </p>
      </div>

      {/* Upload Zone */}
      <form onSubmit={handleUpload} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>INDEX NEW DOCUMENT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-5 cursor-pointer bg-dark-950/40 transition-all">
              <FileText className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-xs text-slate-300 font-medium">
                {selectedFile ? selectedFile.name : 'Click or drop PDF, TXT, or Markdown file'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Up to 20MB per document</span>
              <input
                type="file"
                accept=".pdf,.txt,.md,.markdown"
                onChange={e => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col justify-between space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                {categories.filter(c => c !== 'ALL').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-semibold text-xs hover:bg-cyan-300 disabled:opacity-40 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{isUploading ? 'Chunking & Indexing...' : 'Upload & Process'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* RAG Knowledge Search Tester */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span>TEST RAG RETRIEVAL QUERY</span>
        </div>
        <form onSubmit={handleTestSearch} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask question against your knowledge base (e.g. 'What are the main project specifications?')"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono transition-all flex-shrink-0"
          >
            {isSearching ? 'Searching...' : 'Search Chunks'}
          </button>
        </form>

        {searchResults && (
          <div className="pt-2 space-y-2">
            <span className="text-[11px] font-mono text-slate-400">RETRIEVED CHUNKS ({searchResults.length}):</span>
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No matching knowledge chunks found.</p>
            ) : (
              searchResults.map((chunk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-dark-950 border border-white/5 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                    <span>{chunk.title}</span>
                    <span>Page {chunk.page}</span>
                  </div>
                  <p className="line-clamp-3 text-slate-300">{chunk.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Indexed Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold tracking-wider text-slate-300">INDEXED DOCUMENTS</h3>
          <div className="flex space-x-1">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono ${
                  category === c
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {documents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              No documents indexed in this category yet.
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc._id} className="glass-card rounded-2xl p-4 flex items-center justify-between space-x-3 group">
                <div className="flex items-center space-x-3 truncate">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-medium text-slate-200 truncate">{doc.fileName}</h4>
                    <p className="text-[10px] font-mono text-slate-400 space-x-2">
                      <span>{doc.category}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{doc.chunkCount} chunks</span>
                      <span>•</span>
                      <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    READY
                  </span>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
