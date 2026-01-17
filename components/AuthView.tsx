
import React, { useState } from 'react';
import { User } from '../types';
import { BrainLogo } from './Logo';

interface AuthViewProps {
  onAuth: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: `user-${Date.now()}`,
      name: isLogin ? (email.split('@')[0]) : name,
      email: email || 'guest@brainora.ai',
    };
    onAuth(user);
  };

  const handleGuestAccess = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: 'guest@brainora.ai',
    };
    onAuth(guestUser);
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <BrainLogo size={64} className="mx-auto mb-6" />
          <h2 id="auth-title" className="text-3xl font-extrabold text-[#1a365d] tracking-tight">
            {isLogin ? 'Brainora AI Access' : 'Register with Brainora'}
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            Intelligence synthesized for your workflow
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="full-name" className="sr-only">Full Name</label>
              <input
                id="full-name"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent transition-all sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              type="email"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent transition-all sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent transition-all sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#1a365d] hover:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a365d] transition-all shadow-lg active:scale-[0.98]"
            >
              {isLogin ? 'Sign in' : 'Initialize Account'}
            </button>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full flex justify-center py-3 px-4 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition-all active:scale-[0.98]"
            >
              Enter Guest Mode
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-[#60a5fa] hover:text-[#1a365d] transition-colors focus:outline-none focus:underline"
          >
            {isLogin ? "No account? Join the intellect" : 'Already part of Brainora? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
