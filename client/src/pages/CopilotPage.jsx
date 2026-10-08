import React, { useState } from 'react';
import api from '../services/api';
import { Bot, Send, User, Sparkles, AlertCircle } from 'lucide-react';

export default function CopilotPage() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am your AI Operations Copilot. I analyze authorized company datasets to answer queries regarding machine risks, stockout warnings, material consumption variances, and process rework bottlenecks. What would you like to investigate?"
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sampleQueries = [
    "Which machine should we inspect first?",
    "Why is this machine at risk?",
    "Which operational issue has the highest impact?",
    "Where are we seeing material over-consumption?",
    "Which inventory items have stockout risk?",
    "Which processes generate the most rework?"
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || query;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setChatHistory(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/copilot/query', { query: textToSend });
      if (res.data.success && res.data.response) {
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.response.answer,
            data_source: res.data.response.data_source,
            has_sufficient_data: res.data.response.has_sufficient_data
          }
        ]);
      }
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I experienced an error querying the operations database. Please ensure your Python AI service is running and company datasets are analyzed."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Operations Copilot</h2>
            <p className="text-[11px] text-slate-500">Grounded strictly in verified company dataset analysis</p>
          </div>
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl flex space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${msg.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-amber-400'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.data_source && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Source: {msg.data_source}</span>
                    {msg.has_sufficient_data === false && (
                      <span className="text-amber-600 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Insufficient Data</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500 animate-pulse flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-600 animate-spin" />
              <span>Analyzing operational data models...</span>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Pills */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase flex-shrink-0">Suggested:</span>
        {sampleQueries.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] text-slate-700 dark:text-slate-300 hover:border-brand-500 flex-shrink-0 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask AI Copilot about machine health, inventory, material consumption, or rework..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
