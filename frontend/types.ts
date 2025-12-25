export enum Platform {
  TIKTOK = 'TikTok',
  YOUTUBE = 'YouTube',
  INSTAGRAM = 'Instagram',
  TWITTER = 'X (Twitter)'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface HistoryPoint {
  timestamp: string;
  views: number;
  likes: number;
  comments: number;
}

export interface ContentItem {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  platform: Platform;
  
  // Current Stats
  views: number;
  likes: number;
  comments: number;
  shares: number;
  
  // Computed Metrics
  engagementRate: number; // Percentage
  viralityScore: number; // Custom formula
  sentimentScore: number; // 0 to 100
  
  publishedAt: string;
  parsedAt: string;
  url: string;
  tags: string[];
  
  // Historical data for the "Microscope" chart
  history: HistoryPoint[];
}

export interface PlatformStats {
  platform: Platform;
  totalViews: number;
  activeTracked: number;
  viralVelocity: number; 
  trendHistory: { timestamp: string; value: number }[];
}

export interface SystemMetrics {
  totalVideosStored: number;
  avgLikes: number;
  topCreator24h: { name: string; growth: number };
  parsingActivity: { hour: string; count: number }[]; // For the "Activity by Hour" chart
}

export interface AIAnalysisResult {
  summary: string;
  opportunities: string[];
  riskAssessment: string;
  predictedTrend: 'Rising' | 'Stable' | 'Falling';
}