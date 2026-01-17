
import React, { useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2,
  LogOut,
  Settings,
  History,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';
import { BrainLogo } from './Logo';

interface SidebarProps {
  user: User | null;
  onNewChat: () => void;
  chats: any[];
  onSearch: (term: string) => void;
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onReorderChat: (id: string, direction: 'up' | 'down') => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user,
  onNewChat, 
  chats, 
  onSearch, 
  activeId, 
  onSelectChat,
  onDeleteChat,
  onReorderChat,
  onLogout,
  isMobileOpen,
  onCloseMobile
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
        if (onCloseMobile) onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseMobile]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] lg:hidden animate-in fade-in duration-300" 
          onClick={onCloseMobile}
        />
      )}
      
      <aside className={`
        fixed lg:relative z-[50] lg:z-0 h-full bg-[#fdfdfd] flex flex-col p-5 transition-transform duration-300 border-r-2 border-slate-200 w-64
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} aria-label="Sidebar">
        
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <BrainLogo size={28} />
            <span className="font-black text-lg tracking-tight text-[#1a365d] uppercase">Brainora <span className="text-[#3b82f6]">AI</span></span>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <button
          onClick={() => { onNewChat(); if (onCloseMobile) onCloseMobile(); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-8 rounded-2xl text-[13px] font-black bg-white border-2 border-slate-200 shadow-md hover:shadow-lg hover:border-slate-300 text-[#1a365d] transition-all active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={3} className="text-[#3b82f6]" />
          New Session
        </button>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" strokeWidth={2.5} />
          <input 
            type="text"
            placeholder="Search sessions..."
            className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-bold focus:outline-none focus:bg-white focus:border-slate-400 transition-all placeholder:text-slate-500 text-slate-950"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch(e.target.value);
            }}
          />
        </div>

        <nav className="flex-1 space-y-1 overflow-hidden flex flex-col">
          <div className="pb-3 px-3 text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 mb-2">
            <History size={14} strokeWidth={2.5} />
            Core History
          </div>
          
          <div className="flex-1 space-y-1 overflow-y-auto pr-1 no-scrollbar">
            {chats.length > 0 ? chats.map((chat, index) => (
              <div key={chat.id} className="group relative">
                <button 
                  onClick={() => { onSelectChat(chat.id); if (onCloseMobile) onCloseMobile(); }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] rounded-xl truncate pr-20 transition-all ${
                    activeId === chat.id 
                    ? 'bg-slate-200 text-[#1a365d] font-black shadow-sm' 
                    : 'text-slate-600 hover:text-[#1a365d] hover:bg-slate-100 font-bold'
                  }`}
                >
                  {chat.title}
                </button>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="flex flex-col">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onReorderChat(chat.id, 'up'); }}
                      className={`p-0.5 text-slate-400 hover:text-blue-600 transition-all ${index === 0 ? 'invisible' : ''}`}
                      title="Move Up"
                    >
                      <ChevronUp size={14} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onReorderChat(chat.id, 'down'); }}
                      className={`p-0.5 text-slate-400 hover:text-blue-600 transition-all ${index === chats.length - 1 ? 'invisible' : ''}`}
                      title="Move Down"
                    >
                      <ChevronDown size={14} strokeWidth={3} />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="px-4 py-6 text-[12px] text-slate-500 italic font-bold text-center">No active history found</div>
            )}
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-slate-100" ref={menuRef}>
          <div className="relative">
            {showProfileMenu && (
              <div className="absolute bottom-full left-0 w-full mb-3 bg-white rounded-2xl shadow-2xl border-2 border-slate-100 py-1 z-50 animate-in slide-in-from-bottom-2 duration-300">
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100 transition-colors"
                  onClick={() => { setShowProfileMenu(false); }}
                >
                  <Settings size={18} className="text-slate-600" />
                  Core Settings
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-rose-600 hover:bg-rose-50 transition-colors"
                  onClick={() => { setShowProfileMenu(false); onLogout(); }}
                >
                  <LogOut size={18} />
                  Terminate Session
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-2xl transition-all duration-300 border-2 ${showProfileMenu ? 'bg-slate-100 border-slate-300 shadow-inner' : 'hover:bg-slate-50 border-transparent'}`}
            >
              <div className="w-10 h-10 bg-[#1a365d] rounded-xl flex items-center justify-center text-white text-[12px] font-black shadow-lg shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'GU'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[13px] font-black truncate text-slate-950">{user?.name || 'Guest'}</div>
                <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                  Active Member
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
