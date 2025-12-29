
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
  authHeader?: string; // Base64 credentials for Basic Auth
}

export interface HistoryPoint {
  timestamp: string;
  views: number;
  likes: number;
}

export interface ContentItem {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  viralityScore: number;
  engagementRate: number;
  sentimentScore: number;
  publishedAt: string;
  parsedAt: string;
  url: string;
  tags: string[];
  history?: HistoryPoint[];
}

export interface DashboardData {
  totalAssets: number;
  systemStatus: 'Nominal' | 'Warning' | 'Down';
  leaderboard: ContentItem[];
}

// Interface for AI trend analysis results returned by Gemini
export interface AIAnalysisResult {
  summary: string;
  opportunities: string[];
  riskAssessment: string;
  predictedTrend: 'Rising' | 'Stable' | 'Falling';
}

// Interface for platform-specific statistics used in analytics and visualizations
export interface PlatformStats {
  platform: Platform;
  viralVelocity: number;
  trendHistory: { timestamp: string; value: number }[];
}
