
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { generateAcademicResponse } from '../services/geminiService';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to the official Federal Urdu University Academic Assistant. I am here to provide factual information regarding admissions, fees, and campus policies based on our verified institutional records.\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const result = await generateAcademicResponse(userMessage.text);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: result.text,
      timestamp: new Date(),
      sources: result.sources
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Refined Header */}
      <div className="bg-[#1e3a8a] pt-8 pb-6 px-8 text-white relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
           <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors w-10 h-10 flex items-center justify-center">
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group">
            <i className="fas fa-graduation-cap text-[#1e3a8a] text-2xl"></i>
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight">Academic AI</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Document Grounded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 chat-scroll bg-slate-50/30"
      >
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all hover:shadow-md ${
              m.role === 'user' 
                ? 'bg-[#1e3a8a] text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap font-medium">{m.text}</p>
              
              <div className={`mt-3 pt-2 border-t flex justify-between items-center opacity-50 text-[9px] font-bold uppercase tracking-wider ${
                m.role === 'user' ? 'border-white/10 text-blue-100' : 'border-slate-100 text-slate-400'
              }`}>
                <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {m.role === 'assistant' && <span>Institutional Data</span>}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-600/30 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600/60 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Input Bar */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about admissions, fees, programs..."
            className="w-full pl-6 pr-14 py-4 bg-slate-100 rounded-2xl text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border-transparent focus:border-blue-500/30 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-[#1e3a8a] text-white rounded-xl shadow-lg shadow-blue-900/20 disabled:opacity-30 disabled:shadow-none hover:bg-blue-800 transition-all flex items-center justify-center active:scale-95"
          >
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </form>
        <div className="flex items-center justify-center gap-2 mt-4 opacity-30">
           <i className="fas fa-shield-alt text-[10px]"></i>
           <p className="text-[9px] text-center font-black uppercase tracking-[0.2em] text-slate-900">
            FYP Prototype • DCS FUUAST
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
