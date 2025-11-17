from TikTokApi import TikTokApi
import logging
from . import config

async def get_trending_videos(count: int):
    """Получает список популярных видео из TikTok."""
    video_list = []

    if not config.MS_TOKEN:
        logging.error("Не найден ms_token в .env файле! Парсинг невозможен.")
        return video_list

    logging.info(f"Запрос {count} трендовых видео из TikTok...")
    try:
        async with TikTokApi() as api:
            # Создаем сессию с нашим токеном
            await api.create_sessions(ms_tokens=[config.MS_TOKEN], num_sessions=1, sleep_after=3, browser=config.TIKTOK_BROWSER)

            # Асинхронно итерируемся по видео
            async for video in api.trending.videos(count=count):
                video_list.append(video.as_dict)

    except Exception as e:
        logging.error(f"Произошла ошибка при парсинге TikTok: {e}", exc_info=True)

    logging.info(f"Успешно получено {len(video_list)} видео.")
    return video_list