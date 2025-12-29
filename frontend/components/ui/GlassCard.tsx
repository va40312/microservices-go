
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div 
      {...props}
      className={`
        relative overflow-hidden
        bg-[#0f0f12]/60 
        backdrop-blur-2xl 
        border border-white/[0.06] 
        shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        rounded-2xl
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:bg-[#16161a]/80 hover:border-white/10 hover:shadow-indigo-500/5 cursor-pointer hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {/* Subtle shine effect on top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      
      {/* Content wrapper - Removed forced h-full to prevent empty space at the bottom of lists */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
