
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from './ui/GlassCard';
import { TrendingUp, ArrowRight, Loader2, Lock, User as UserIcon } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>

      <GlassCard className="w-full max-w-md p-8 backdrop-blur-3xl border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-6 transition-transform hover:scale-105 duration-300">
            <TrendingUp className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Login</h1>
          <p className="text-zinc-500 text-sm mt-3 text-center px-4">
            Enter your credentials to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Username</label>
            <div className="relative">
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                placeholder="Enter username"
              />
              <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 w-4 h-4" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                placeholder="Enter password"
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 w-4 h-4" />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-xs text-center font-medium">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_20px_-10px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2 group disabled:opacity-70 mt-4 active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                Login
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
