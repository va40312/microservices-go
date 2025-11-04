import logging
import time
import asyncio  # <-- ИМПОРТИРУЕМ ASYNCIO
from src import config
from src.tiktok_parser import get_trending_videos
from src.message_formatter import format_tiktok_message
from src.kafka_producer import MediaContentProducer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def run_parser_cycle(producer: MediaContentProducer):
    """Выполняет один цикл работы: парсинг, форматирование, отправка."""

    # --- ИЗМЕНЯЕМ ВЫЗОВ ФУНКЦИИ ---
    # Так как get_trending_videos теперь асинхронная, ее нужно запускать через asyncio.run()
    videos = asyncio.run(get_trending_videos(config.TRENDING_VIDEO_COUNT))

    if not videos:
        logging.warning("Не удалось получить видео из TikTok, пропуск цикла.")
        return

    for video_data in videos:
        message = format_tiktok_message(video_data)
        producer.send_message(config.KAFKA_TOPIC, message)

    producer.flush()
    logging.info(f"Отправлено {len(videos)} сообщений в Kafka.")


if __name__ == "__main__":
    logging.info("Запуск сервиса парсинга TikTok...")

    try:
        kafka_producer = MediaContentProducer(config.KAFKA_BOOTSTRAP_SERVERS)
    except Exception:
        logging.critical("Не удалось инициализировать продюсер Kafka. Сервис остановлен.")
        exit(1)

    while True:
        run_parser_cycle(kafka_producer)
        logging.info(f"Пауза на {config.PARSE_INTERVAL_SECONDS} секунд...")
        time.sleep(config.PARSE_INTERVAL_SECONDS)