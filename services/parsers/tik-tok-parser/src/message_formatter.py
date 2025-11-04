from datetime import datetime, timezone
def format_tiktok_message(video_data: dict) -> dict:
    """Форматирует данные из TikTok в расширенный универсальный формат для анализа."""

    # --- Основные объекты ---
    stats = video_data.get('stats', {})
    author = video_data.get('author', {})
    music = video_data.get('music', {})
    video_info = video_data.get('video', {})
    author_stats = video_data.get('authorStats', {})

    # --- Извлечение даты создания (как и раньше) ---
    create_time_unix = video_data.get('createTime', 0)
    published_at_iso = datetime.fromtimestamp(create_time_unix,
                                              tz=timezone.utc).isoformat() if create_time_unix else None

    # --- ИСПРАВЛЕННАЯ ЛОГИКА ИЗВЛЕЧЕНИЯ ХЭШТЕГОВ ---
    # Хэштеги находятся в поле 'textExtra'
    text_extra_list = video_data.get('textExtra', [])
    # Фильтруем список: берем только словари с type=1 (это хэштеги) и извлекаем 'hashtagName'
    hashtags = [item.get('hashtagName') for item in text_extra_list if
                item.get('type') == 1 and item.get('hashtagName')]

    return {
        "source": "tiktok",
        "event_time": datetime.now(timezone.utc).isoformat(),
        "data_type": "video",
        "payload": {
            "platform_id": video_data.get('id'),
            "description": video_data.get('desc'),
            "published_at": published_at_iso,
            "url": f"https://www.tiktok.com/@{author.get('uniqueId')}/video/{video_data.get('id')}",
            # --- Основные метрики вовлеченности ---
            "stats": {
                "views": stats.get('playCount'),
                "likes": stats.get('diggCount'),
                "comments": stats.get('commentCount'),
                "shares": stats.get('shareCount'),
                "saves": stats.get('collectCount')
            },
            "content_meta": {
                "duration": video_info.get('duration'),
                "hashtags": hashtags,
                "music_title": music.get('title'),
                "is_original_sound": music.get('original', False)
            },
            "author": {
                "username": author.get('uniqueId'),
                "nickname": author.get('nickname'),
                "follower_count": author_stats.get('followerCount')
            }
        }
    }