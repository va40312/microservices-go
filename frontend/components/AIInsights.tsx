import React from 'react';
import { AIAnalysisResult } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

export const AIInsights: React.FC<{ analysis: AIAnalysisResult | null, loading: boolean }> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-4 w-1/3 bg-white/10 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded"></div>
          <div className="h-3 w-5/6 bg-white/5 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!analysis) return null;

  return (
    <GlassCard className="p-0">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-400 w-5 h-5" />
          <h2 className="font-semibold text-white">Gemini Analysis</h2>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-xs font-bold border
          ${analysis.predictedTrend === 'Rising' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
            analysis.predictedTrend === 'Falling' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
            'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}
        `}>
          Trend: {analysis.predictedTrend}
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Lightbulb size={12} /> Opportunities
            </h4>
            <ul className="space-y-2">
              {analysis.opportunities.map((opp, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 mt-2"></span>
                  {opp}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <AlertTriangle size={12} /> Risk Assessment
            </h4>
            <p className="text-sm text-zinc-400">
              {analysis.riskAssessment}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};