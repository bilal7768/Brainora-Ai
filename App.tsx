
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputBar from './components/InputBar';
import AuthView from './components/AuthView';
import { Message, ChatSession, User } from './types';
import { geminiService } from './services/geminiService';
import { ChevronDown, Share2, PanelLeft, PanelLeftClose, Menu } from 'lucide-react';
import { BrainLogo } from './components/Logo';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('brainora_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [chats, setChats] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('brainora_chats');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('brainora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('brainora_user');
      localStorage.removeItem('brainora_chats');
      setChats([]);
      setMessages([]);
      setActiveChatId(null);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('brainora_chats', JSON.stringify(chats));
    }
  }, [chats, user]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    mainContentRef.current?.focus();
  };

  const handleSelectChat = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (chat) {
      setActiveChatId(id);
      setMessages(chat.messages);
      mainContentRef.current?.focus();
    }
  };

  const handleDeleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      handleNewChat();
    }
  };

  const handleReorderChat = (id: string, direction: 'up' | 'down') => {
    setChats(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      const newChats = [...prev];
      if (direction === 'up' && index > 0) [newChats[index], newChats[index - 1]] = [newChats[index - 1], newChats[index]];
      else if (direction === 'down' && index < prev.length - 1) [newChats[index], newChats[index + 1]] = [newChats[index + 1], newChats[index]];
      return newChats;
    });
  };

  const handleSend = useCallback(async (content: string, mode: 'default' | 'knowledge' | 'search' | 'creative' | 'live' = 'default') => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    // Enhanced Multilingual Image Intent Logic
    const lowercaseContent = content.toLowerCase();
    const imageKeywords = ['image', 'picture', 'photo', 'drawing', 'art', 'tasveer', 'tasvir', 'photo banao', 'tasveer banao', 'draw'];
    const actionKeywords = ['create', 'generate', 'make', 'draw', 'banao', 'show'];
    
    const hasImageIntent = imageKeywords.some(k => lowercaseContent.includes(k));
    const hasActionIntent = actionKeywords.some(k => lowercaseContent.includes(k));
    
    if ((mode === 'creative' || (hasImageIntent && hasActionIntent)) && content.length > 3) {
      try {
        const imageUrl = await geminiService.generateImage(content);
        if (imageUrl) {
          const imageMessage: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            content: `I have synthesized the visualization for: "${content}"`, 
            imageUrl, 
            isImage: true, 
            timestamp: new Date() 
          };
          const finalMessages = [...updatedMessages, imageMessage];
          setMessages(finalMessages);
          
          if (!activeChatId) {
             const newChat: ChatSession = { id: Date.now().toString(), title: content.slice(0, 30), messages: finalMessages, createdAt: new Date() };
             setChats(prev => [newChat, ...prev]); 
             setActiveChatId(newChat.id);
          } else {
             setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: finalMessages } : c));
          }
          setIsStreaming(false);
          return;
        } else {
          // Fallback if image fails - try to explain why as text
          const fallbackMessage: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            content: "I tried to generate an image but my visualization core encountered an issue. I'll describe it instead: " + content, 
            timestamp: new Date() 
          };
          setMessages([...updatedMessages, fallbackMessage]);
        }
      } catch (err) {
        console.error("Image handling error:", err);
      } finally { 
        setIsStreaming(false); 
      }
      // If image failed and we didn't return, we'll fall through to normal stream if we didn't handle it.
      // But we handled it in the else above.
      return;
    }

    // Live mode (Grounding) handling
    if (mode === 'live') {
      try {
        const { text, links } = await geminiService.chatWithGrounding(messages, content);
        const modelMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: text,
          groundingLinks: links,
          timestamp: new Date()
        };
        const finalMessages = [...updatedMessages, modelMessage];
        setMessages(finalMessages);
        if (!activeChatId) {
          const newChat: ChatSession = { id: Date.now().toString(), title: content.slice(0, 30), messages: finalMessages, createdAt: new Date() };
          setChats(prev => [newChat, ...prev]); setActiveChatId(newChat.id);
        } else {
          setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: finalMessages } : c));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsStreaming(false);
      }
      return;
    }

    // Default streaming logic
    const modelMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', content: '', timestamp: new Date() };
    setMessages(prev => [...prev, modelMessage]);

    try {
      let fullContent = '';
      const stream = geminiService.streamChat(messages, content, mode);
      for await (const chunk of stream) {
        if (chunk) {
          fullContent += chunk;
          setMessages(prev => {
            const next = [...prev]; const lastIdx = next.length - 1;
            if (next[lastIdx]) next[lastIdx] = { ...next[lastIdx], content: fullContent };
            return next;
          });
        }
      }
      const finalMessages = [...updatedMessages, { ...modelMessage, content: fullContent }];
      if (!activeChatId) {
        const newChat: ChatSession = { id: Date.now().toString(), title: content.slice(0, 30), messages: finalMessages, createdAt: new Date() };
        setChats(prev => [newChat, ...prev]); setActiveChatId(newChat.id);
      } else {
        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: finalMessages } : c));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally { setIsStreaming(false); }
  }, [messages, activeChatId, chats]);

  if (!user) return <AuthView onAuth={setUser} />;

  const filteredMessages = messages.filter(m => m.content.toLowerCase().includes(searchFilter.toLowerCase()));
  const displayChats = chats.filter(c => c.title.toLowerCase().includes(searchFilter.toLowerCase()));

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden selection:bg-blue-50 selection:text-blue-900">
      <Sidebar user={user} onNewChat={handleNewChat} chats={displayChats} onSearch={setSearchFilter} activeId={activeChatId} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} onReorderChat={handleReorderChat} onLogout={() => setUser(null)} isMobileOpen={isMobileSidebarOpen} onCloseMobile={() => setIsMobileSidebarOpen(false)} />
      <main id="main-chat-content" ref={mainContentRef} tabIndex={-1} className={`flex-1 flex flex-col min-w-0 relative focus:outline-none bg-[#fdfdfd] transition-all duration-300 ${isSidebarOpen ? '' : 'lg:pl-0'}`}>
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white/70 backdrop-blur-xl z-20 border-b border-slate-100/50">
          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-[#1a365d] hover:bg-slate-50 rounded-xl transition-all"><Menu size={20} /></button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block p-2 text-slate-400 hover:text-[#1a365d] hover:bg-slate-50 rounded-xl transition-all">{isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}</button>
            <div className="flex items-center gap-2 lg:gap-3 group cursor-pointer" role="button">
              <BrainLogo size={24} />
              <h1 className="text-[12px] lg:text-[13px] font-black text-[#1a365d] tracking-widest flex items-center gap-1.5 uppercase">Brainora <span className="text-[#3b82f6]">Core</span><ChevronDown size={14} className="hidden sm:block text-slate-300 transition-transform group-hover:translate-y-0.5" /></h1>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <button onClick={() => { const text = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n'); if (navigator.share) navigator.share({ text }); }} className="hidden sm:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#1a365d] hover:bg-slate-50 rounded-xl transition-all"><Share2 size={14} />Share</button>
          </div>
        </header>
        <ChatArea messages={filteredMessages} isStreaming={isStreaming} onRetry={(content) => handleSend(content)} />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#fdfdfd] via-[#fdfdfd]/95 to-transparent h-40 z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none px-4"><div className="pointer-events-auto"><InputBar onSend={handleSend} disabled={isStreaming} /></div></div>
      </main>
    </div>
  );
};

export default App;
