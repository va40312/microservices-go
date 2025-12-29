
import { ContentItem, DashboardData, HistoryPoint, Platform } from '../types';

// Отключаем моки для работы с реальным API
const USE_MOCKS = false;
const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Маппинг VideoInList (из OpenAPI) в ContentItem (для UI)
 */
const mapBackendToFrontend = (data: any): ContentItem => {
  const stats = data.stats || {};
  const metrics = data.metrics || {};
  const author = data.author || {};
  
  // Нормализация платформы на основе поля source
  let platform = Platform.TIKTOK;
  const source = (data.source || '').toLowerCase();
  if (source.includes('youtube')) platform = Platform.YOUTUBE;
  else if (source.includes('instagram')) platform = Platform.INSTAGRAM;
  else if (source.includes('twitter') || source === 'x') platform = Platform.TWITTER;

  return {
    id: data._id || data.video_platform_id,
    title: data.title || 'Untitled Video',
    author: author.username || author.nickname || 'Unknown',
    thumbnail: `https://picsum.photos/seed/${data.video_platform_id || data._id}/400/225`,
    platform: platform,
    views: stats.views ?? 0,
    likes: stats.likes ?? 0,
    comments: stats.comments ?? 0,
    shares: stats.shares ?? 0,
    viralityScore: metrics.virality_score ?? 0,
    engagementRate: metrics.engagement_rate ?? 0,
    sentimentScore: 0, // Не используется
    publishedAt: data.published_at || new Date().toISOString(),
    parsedAt: new Date().toISOString(),
    url: data.url || '#',
    tags: []
  };
};

const getAuthHeader = () => {
  const user = localStorage.getItem('trendpulse_user');
  if (user) {
    const parsed = JSON.parse(user);
    return parsed.authHeader ? { 'Authorization': `Basic ${parsed.authHeader}` } : {};
  }
  return {};
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('trendpulse_user');
    window.location.reload();
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `Status: ${response.status}`);
  }
  return response.json();
};

// --- API EXPORTS ---

export const fetchDashboardData = async (): Promise<DashboardData> => {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => resolve({
      totalAssets: 42000,
      systemStatus: 'Nominal',
      leaderboard: []
    }), 600));
  }
  
  const response = await fetch(`${API_BASE_URL}/videos/dashboard`, {
    headers: { ...getAuthHeader() }
  });
  const res = await handleResponse(response);
  
  // Маппим статус из API. Если 'ok' -> 'Nominal', иначе берем как есть или 'Warning'
  const rawStatus = res.stats?.status || 'Warning';
  const mappedStatus = rawStatus.toLowerCase() === 'ok' ? 'Nominal' : 
                       (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1));

  return {
    totalAssets: res.stats?.total_assets ?? 0,
    systemStatus: mappedStatus as any,
    leaderboard: (res.leaderboard || []).map(mapBackendToFrontend)
  };
};

export const fetchTrendingVideos = async (
  sortBy: string = 'newest', 
  platform: string | null = null,
  page: number = 1
): Promise<ContentItem[]> => {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => resolve([]), 500));
  }

  const params = new URLSearchParams({
    sort_by: sortBy,
    ...(platform ? { platform } : {}),
    page: page.toString(),
    limit: '20'
  });

  const response = await fetch(`${API_BASE_URL}/videos/trending?${params}`, {
    headers: { ...getAuthHeader() }
  });
  const res = await handleResponse(response);
  return (res.data || []).map(mapBackendToFrontend);
};

export const fetchVideoTrajectory = async (id: string): Promise<HistoryPoint[]> => {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => resolve([]), 400));
  }

  const response = await fetch(`${API_BASE_URL}/videos/video/${id}/trajectory`, {
    headers: { ...getAuthHeader() }
  });
  const data = await handleResponse(response);
  return data.map((s: any) => ({
    timestamp: s.snapshot_time,
    views: s.stats?.views ?? 0,
    likes: s.stats?.likes ?? 0
  }));
};
