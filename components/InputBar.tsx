
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ArrowUp, 
  ImageIcon, 
  Zap, 
  Code2, 
  X,
  Sparkles,
  Search,
  BookOpen,
  Globe
} from 'lucide-react';

interface InputBarProps {
  onSend: (message: string, mode?: 'default' | 'knowledge' | 'search' | 'creative' | 'live') => void;
  disabled: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'default' | 'knowledge' | 'search' | 'creative' | 'live'>('default');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSend(trimmedInput, mode);
      setInput('');
      setShowPlusMenu(false);
      setMode('default');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const selectMode = (newMode: 'default' | 'knowledge' | 'search' | 'creative' | 'live') => {
    setMode(newMode);
    setShowPlusMenu(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 10);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const nextHeight = input.length === 0 ? 0 : textarea.scrollHeight;
      textarea.style.height = nextHeight > 0 ? `${Math.min(nextHeight, 200)}px` : 'auto';
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    if (showPlusMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlusMenu]);

  const getPlaceholder = () => {
    switch(mode) {
      case 'knowledge': return "Deep analysis mode...";
      case 'search': return "Fact check mode...";
      case 'creative': return "Visual synthesis mode...";
      case 'live': return "Live Pulse mode (News, Today, Updates)...";
      default: return "Message Brainora AI...";
    }
  };

  const getModeLabel = () => {
    switch(mode) {
      case 'knowledge': return { label: 'Intelligence', color: 'indigo', icon: BookOpen };
      case 'search': return { label: 'Grounding', color: 'amber', icon: Search };
      case 'creative': return { label: 'Synthesis', color: 'purple', icon: Sparkles };
      case 'live': return { label: 'Live Pulse', color: 'emerald', icon: Globe };
      default: return null;
    }
  };

  const activeMode = getModeLabel();

  return (
    <div className="max-w-3xl mx-auto w-full pb-6 lg:pb-8" role="region" aria-label="Composer">
      <div className="relative flex flex-col gap-2">
        {activeMode && (
          <div className="flex items-center self-start px-3 py-1 bg-white border-2 border-slate-300 rounded-full shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 ml-2">
            <activeMode.icon size={12} className={`mr-2 text-${activeMode.color}-700`} strokeWidth={3} />
            <span className={`text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-wider`}>
              {activeMode.label} Core
            </span>
            <button onClick={() => setMode('default')} className="ml-2 p-0.5 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"><X size={10} strokeWidth={3} /></button>
          </div>
        )}

        <div className="relative bg-white border-2 border-slate-300 rounded-[24px] lg:rounded-[28px] shadow-xl focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-200/50 transition-all duration-300 p-1.5 backdrop-blur-md flex items-end">
          
          {showPlusMenu && (
            <div ref={menuRef} className="absolute bottom-[calc(100%+12px)] left-0 w-full lg:w-64 bg-white rounded-3xl shadow-2xl border-2 border-slate-100 p-2 z-50 animate-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
                <button onClick={() => selectMode("live")} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-emerald-50 transition-colors text-xs lg:text-sm text-slate-900 font-black group text-left">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"><Globe size={16} strokeWidth={2.5} /></div>
                  Live Updates
                </button>
                <button onClick={() => selectMode("knowledge")} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-indigo-50 transition-colors text-xs lg:text-sm text-slate-900 font-black group text-left">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0"><Code2 size={16} strokeWidth={2.5} /></div>
                  Analysis
                </button>
                <button onClick={() => selectMode("search")} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-amber-50 transition-colors text-xs lg:text-sm text-slate-900 font-black group text-left">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0"><Search size={16} strokeWidth={2.5} /></div>
                  Search
                </button>
                <button onClick={() => selectMode("creative")} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-purple-50 transition-colors text-xs lg:text-sm text-slate-900 font-black group text-left">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0"><ImageIcon size={16} strokeWidth={2.5} /></div>
                  Vision
                </button>
              </div>
            </div>
          )}

          <div className="flex-shrink-0 pb-0.5">
            <button onClick={() => setShowPlusMenu(!showPlusMenu)} className={`p-2 lg:p-2.5 hover:bg-slate-100 rounded-full transition-all group focus:outline-none ${showPlusMenu ? 'bg-slate-200 rotate-45 text-slate-950' : 'text-[#3b82f6]'}`}><Plus size={24} strokeWidth={3} /></button>
          </div>
          
          <textarea id="chat-textarea" ref={textareaRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={getPlaceholder()} className="flex-1 max-h-[150px] lg:max-h-[200px] resize-none py-2.5 lg:py-3 px-2 focus:outline-none text-[15px] lg:text-[16px] text-slate-950 bg-transparent disabled:opacity-50 placeholder:text-slate-500 font-bold leading-normal lg:leading-relaxed" disabled={disabled} />
          
          <div className="flex-shrink-0 pb-0.5 pr-0.5">
            <button onClick={handleSubmit} disabled={!input.trim() || disabled} className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full transition-all flex items-center justify-center focus:outline-none ${input.trim() && !disabled ? 'bg-[#1a365d] text-white hover:bg-black active:scale-90 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><ArrowUp size={22} strokeWidth={4} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBar;
