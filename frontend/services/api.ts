import { ContentItem, Platform, PlatformStats, SystemMetrics } from '../types';

// Helper to generate history curve
const generateHistory = (baseViews: number): any[] => {
  const history = [];
  let currentViews = baseViews * 0.1;
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Simulate exponential growth then plateau
    const growthFactor = i < 3 ? 1.5 : 1.1; 
    currentViews = currentViews * growthFactor;
    
    history.push({
      timestamp: time.toISOString().split('T')[0],
      views: Math.round(currentViews),
      likes: Math.round(currentViews * 0.08), // approx 8% like rate
      comments: Math.round(currentViews * 0.005) // approx 0.5% comment rate
    });
  }
  return history;
};

const MOCK_VIDEOS: ContentItem[] = [
  {
    id: '1',
    title: 'AI Agents are taking over 2025',
    author: 'TechVisionary',
    thumbnail: 'https://picsum.photos/400/225?random=1',
    platform: Platform.YOUTUBE,
    views: 125000,
    likes: 8500,
    comments: 1240,
    shares: 450,
    engagementRate: 6.8,
    viralityScore: 82,
    sentimentScore: 88,
    publishedAt: '2024-05-10T14:00:00Z',
    parsedAt: '2024-05-10T15:30:00Z',
    url: '#',
    tags: ['tech', 'ai', 'future'],
    history: generateHistory(125000)
  },
  {
    id: '2',
    title: 'Morning Routine Aesthetic ☕️',
    author: 'SarahVlogs',
    thumbnail: 'https://picsum.photos/300/500?random=2',
    platform: Platform.TIKTOK,
    views: 2500000,
    likes: 450000,
    comments: 5600,
    shares: 12000,
    engagementRate: 18.2,
    viralityScore: 98,
    sentimentScore: 92,
    publishedAt: '2024-05-12T09:30:00Z',
    parsedAt: '2024-05-12T09:45:00Z',
    url: '#',
    tags: ['lifestyle', 'vlog', 'aesthetic'],
    history: generateHistory(2500000)
  },
  {
    id: '3',
    title: 'Coding ASMR - Rust Programming',
    author: 'DevSpace',
    thumbnail: 'https://picsum.photos/400/225?random=3',
    platform: Platform.YOUTUBE,
    views: 45000,
    likes: 3200,
    comments: 150,
    shares: 40,
    engagementRate: 7.1,
    viralityScore: 45,
    sentimentScore: 95,
    publishedAt: '2024-05-11T18:00:00Z',
    parsedAt: '2024-05-11T19:00:00Z',
    url: '#',
    tags: ['coding', 'rust', 'asmr'],
    history: generateHistory(45000)
  },
  {
    id: '4',
    title: 'POV: You missed the bitcoin dip',
    author: 'CryptoKing',
    thumbnail: 'https://picsum.photos/300/500?random=4',
    platform: Platform.TIKTOK,
    views: 890000,
    likes: 12000,
    comments: 8900, // High comments = controversial
    shares: 500,
    engagementRate: 1.3,
    viralityScore: 76, // High because of comment density
    sentimentScore: 45,
    publishedAt: '2024-05-12T11:00:00Z',
    parsedAt: '2024-05-12T12:00:00Z',
    url: '#',
    tags: ['crypto', 'finance', 'comedy'],
    history: generateHistory(890000)
  },
  {
    id: '5',
    title: 'New Shadcn UI Kit Review',
    author: 'FrontendMaster',
    thumbnail: 'https://picsum.photos/400/225?random=5',
    platform: Platform.YOUTUBE,
    views: 12000,
    likes: 1500,
    comments: 300,
    shares: 200,
    engagementRate: 16.6,
    viralityScore: 60,
    sentimentScore: 98,
    publishedAt: '2024-05-13T08:00:00Z',
    parsedAt: '2024-05-13T09:00:00Z',
    url: '#',
    tags: ['react', 'ui', 'design'],
    history: generateHistory(12000)
  },
  {
    id: '6',
    title: 'Stop doing this in the gym',
    author: 'FitLife',
    thumbnail: 'https://picsum.photos/300/500?random=6',
    platform: Platform.TIKTOK,
    views: 550000,
    likes: 22000,
    comments: 400,
    shares: 8000,
    engagementRate: 5.5,
    viralityScore: 88,
    sentimentScore: 70,
    publishedAt: '2024-05-13T06:00:00Z',
    parsedAt: '2024-05-13T07:15:00Z',
    url: '#',
    tags: ['fitness', 'gym', 'health'],
    history: generateHistory(550000)
  },
];

const MOCK_METRICS: SystemMetrics = {
  totalVideosStored: 14205,
  avgLikes: 3420,
  topCreator24h: { name: 'SarahVlogs', growth: 125000 },
  parsingActivity: Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    count: Math.floor(Math.random() * 500) + 100 // Random 100-600 videos per hour
  }))
};

export const fetchDashboardContent = async (): Promise<ContentItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_VIDEOS;
};

export const fetchSystemMetrics = async (): Promise<SystemMetrics> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_METRICS;
};

export const fetchPlatformStats = async (): Promise<PlatformStats[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      platform: Platform.TIKTOK,
      totalViews: 8500000,
      activeTracked: 42,
      viralVelocity: 94,
      trendHistory: [],
    },
    {
      platform: Platform.YOUTUBE,
      totalViews: 1200000,
      activeTracked: 15,
      viralVelocity: 65,
      trendHistory: [],
    },
  ];
};