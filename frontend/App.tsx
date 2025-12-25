import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TrendFeedView } from './components/TrendFeedView';
import { VideoDetailModal } from './components/VideoDetailModal';
import { Login } from './components/Login';
import { useAuth } from './context/AuthContext';
import { ContentItem } from './types';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVideo, setSelectedVideo] = useState<ContentItem | null>(null);

  const handleVideoClick = (video: ContentItem) => {
    setSelectedVideo(video);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-indigo-500/30 flex">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-purple-600/05 rounded-full blur-[100px]"></div>
      </div>

      <Sidebar activeTab={activeTab} setTab={setActiveTab} />
      
      {/* Main Content Area - Native browser scrolling for MBP 2014 compatibility */}
      <main className="flex-1 ml-64 relative min-h-screen">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
              {activeTab === 'dashboard' && 'Command Bridge'}
              {activeTab === 'feed' && 'Trend Workstation'}
            </h2>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">
              {activeTab === 'dashboard' ? 'Real-time overview' : 'Parsed data streams'}
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 pl-5 border-l border-white/10">
              <div className="text-right hidden sm:block">
                 <div className="text-sm font-semibold text-white leading-none">{user?.name}</div>
                 <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">System Admin</div>
              </div>
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&bold=true`} 
                alt="Profile" 
                className="w-9 h-9 rounded-xl border border-white/10 shadow-sm" 
              />
              <button 
                onClick={logout}
                className="ml-2 text-xs font-bold text-zinc-500 hover:text-red-400 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-8 py-8 w-full max-w-[1600px] mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView onVideoClick={handleVideoClick} />
          )}
          
          {activeTab === 'feed' && (
            <TrendFeedView onVideoClick={handleVideoClick} />
          )}
        </div>
      </main>

      {/* The Modal */}
      {selectedVideo && (
        <VideoDetailModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? <MainLayout /> : <Login />}
    </>
  );
};

export default App;