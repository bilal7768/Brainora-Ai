
import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { Message as MessageType, GroundingLink } from '../types';
import { 
  Copy, 
  RotateCcw, 
  Download,
  Check,
  Zap,
  Eye,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Coffee,
  Moon,
  Sun
} from 'lucide-react';
import { BrainLogo } from './Logo';

interface ChatAreaProps {
  messages: MessageType[];
  isStreaming: boolean;
  onRetry: (content: string) => void;
  isLiveMode?: boolean;
}

const ChatArea: React.FC<ChatAreaProps & { isLiveMode?: boolean }> = ({ messages, isStreaming, onRetry, isLiveMode }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef(true);

  const timeAwareInfo = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", Icon: Coffee, color: "text-amber-500" };
    if (hour < 17) return { text: "Good Afternoon", Icon: Sun, color: "text-blue-500" };
    if (hour < 21) return { text: "Good Evening", Icon: Moon, color: "text-indigo-500" };
    return { text: "Intelligence Active", Icon: Zap, color: "text-purple-500" };
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      containerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: behavior
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      
      // Calculate scroll progress for the custom scroller thumb
      const totalScrollable = scrollHeight - clientHeight;
      const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
      setScrollProgress(progress);

      // Lock/Unlock auto-scroll: If user scrolls up significantly, disable auto-scroll
      const isAtBottom = totalScrollable - scrollTop < 100;
      isAutoScrollingRef.current = isAtBottom;
    }
  };

  // Auto-scroll logic while streaming
  useEffect(() => {
    if (isStreaming && isAutoScrollingRef.current) {
      // Use 'auto' for high-frequency updates to prevent jitter
      scrollToBottom('auto');
    }
  }, [messages, isStreaming, scrollToBottom]);

  // Initial scroll when new complete messages arrive
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages.length, isStreaming, scrollToBottom]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const percentage = clickY / rect.height;
      const targetScroll = percentage * (containerRef.current.scrollHeight - containerRef.current.clientHeight);
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center space-y-6 lg:space-y-10 mb-20 lg:mb-32 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="p-4 lg:p-5 bg-white rounded-[24px] lg:rounded-[28px] shadow-sm border border-slate-50 relative group">
             <BrainLogo size={56} />
             <div className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#1a365d] tracking-tight sm:text-4xl flex items-center justify-center gap-3">
              <timeAwareInfo.Icon className={timeAwareInfo.color} size={32} strokeWidth={2.5} />
              {timeAwareInfo.text}
            </h2>
            <p className="text-slate-500 font-bold max-w-sm mx-auto">Ready to process your intelligence queries without the fluff.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex overflow-hidden">
      {/* Main Chat Content */}
      <div 
        ref={containerRef} 
        onScroll={handleScroll} 
        className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 lg:py-12 no-scrollbar scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-8 lg:space-y-12 pb-12 lg:pb-16">
          {messages.map((msg, idx) => (
            <article key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} transition-all duration-700 animate-in fade-in slide-in-from-bottom-4`}>
              {msg.role === 'user' ? (
                <div className="bg-white border-2 border-slate-200 text-slate-950 px-4 lg:px-6 py-3 lg:py-4 rounded-[22px] lg:rounded-[26px] rounded-tr-none text-[14px] lg:text-[16px] max-w-[90%] lg:max-w-[85%] inline-block shadow-sm font-bold leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <div className="w-full">
                  <div className="pl-1 pr-2 space-y-4 lg:space-y-6">
                    {msg.isImage && msg.imageUrl ? (
                      <div className="relative group w-full max-w-xl animate-in zoom-in-95 duration-700">
                        <div className="relative overflow-hidden rounded-[20px] lg:rounded-[24px] border-2 border-slate-200 shadow-md bg-slate-50">
                          {/* Use object-contain or refined height to avoid distortion */}
                          <img 
                            src={msg.imageUrl} 
                            alt="Brainora Visual" 
                            className="w-full h-auto max-h-[500px] transition-all duration-700 group-hover:scale-105 block object-contain bg-slate-100" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <button onClick={() => setPreviewImage(msg.imageUrl!)} className="p-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all active:scale-90"><Eye size={24} strokeWidth={2.5} /></button>
                            <a href={msg.imageUrl} download={`brainora-${Date.now()}.png`} className="p-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all active:scale-90"><Download size={24} strokeWidth={2.5} /></a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-slate-950 leading-[1.7] lg:leading-[1.8] text-[15px] lg:text-[16.5px] whitespace-pre-wrap font-bold antialiased min-h-[1.5em] selection:bg-blue-100 selection:text-blue-900">
                          {msg.content}
                          {isStreaming && idx === messages.length - 1 && !msg.content && (
                            <div className="flex gap-1.5 items-center py-2">
                               <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                               <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                               <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            </div>
                          )}
                          {isStreaming && idx === messages.length - 1 && msg.content && (
                            <span className="inline-block w-2 h-2 ml-1.5 bg-blue-600 animate-pulse rounded-full align-middle mb-0.5" />
                          )}
                        </div>

                        {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                          <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <Globe size={12} className="text-emerald-500" />
                              Sources
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {msg.groundingLinks.map((link, lIdx) => (
                                <a 
                                  key={lIdx}
                                  href={link.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-emerald-400 text-slate-500 hover:text-emerald-700 rounded-full text-[11px] font-bold transition-all group"
                                >
                                  <span className="truncate max-w-[150px]">{link.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!isStreaming && (msg.content || msg.imageUrl) && (
                    <div className="flex items-center gap-1 mt-4 lg:mt-6 pl-1 animate-in fade-in duration-500">
                      <button onClick={() => handleCopy(msg.content, msg.id)} className="p-2 lg:p-2.5 text-slate-400 hover:text-[#1a365d] hover:bg-slate-50 rounded-xl transition-all" title="Copy">
                        {copiedId === msg.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} strokeWidth={2.5} />}
                      </button>
                      <button onClick={() => onRetry(messages[idx-1]?.content || '')} className="p-2 lg:p-2.5 text-slate-400 hover:text-blue-700 hover:bg-slate-50 rounded-xl transition-all" title="Regenerate">
                        <RotateCcw size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
          <div className="h-4 lg:h-8"></div>
        </div>
      </div>

      {/* Modern Sidebar Custom Scroller */}
      <div className="w-8 lg:w-10 flex flex-col items-center py-6 h-full border-l border-slate-100 bg-white/30 backdrop-blur-sm z-30">
        <button 
          onClick={scrollToTop}
          className="p-1.5 mb-2 text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95"
          title="Top"
        >
          <ChevronUp size={20} strokeWidth={3} />
        </button>

        <div 
          className="flex-1 w-[2px] lg:w-[3px] bg-slate-100 rounded-full relative cursor-pointer hover:bg-slate-200 transition-colors my-2"
          onClick={handleCustomTrackClick}
        >
          {/* Draggable-style Scroll Thumb */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-[6px] lg:w-[8px] bg-slate-400 hover:bg-blue-500 rounded-full transition-all duration-150"
            style={{ 
              top: `${scrollProgress}%`, 
              height: '40px',
              transform: `translate(-50%, -${scrollProgress}%)`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        <button 
          onClick={() => scrollToBottom('smooth')}
          className="p-1.5 mt-2 text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95"
          title="Bottom"
        >
          <ChevronDown size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Image Preview Modal (Fixed Distortion & Bounds) */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300 p-4 lg:p-12" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-6 right-6 p-4 text-white/40 hover:text-white transition-all z-[210] hover:scale-110" onClick={() => setPreviewImage(null)}><X size={44} /></button>
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewImage} 
              alt="Visual Preview" 
              className="max-w-full max-h-full rounded-2xl shadow-2xl border-2 border-white/10 object-contain block animate-in zoom-in-95 duration-500 select-none" 
            />
            <div className="absolute bottom-6 right-6 pointer-events-none opacity-40">
               <BrainLogo size={48} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
