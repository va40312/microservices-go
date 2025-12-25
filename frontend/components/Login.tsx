import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from './ui/GlassCard';
import { TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>

      <GlassCard className="w-full max-w-md p-8 backdrop-blur-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-4">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isLoginView ? 'Welcome Back' : 'Join TrendPulse'}
          </h1>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            {isLoginView 
              ? 'Enter your credentials to access the analytics dashboard.' 
              : 'Create an account to start monitoring viral trends.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              placeholder="name@example.com"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                {isLoginView ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
