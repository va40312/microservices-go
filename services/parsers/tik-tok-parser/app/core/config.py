# src/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# Настройки Kafka
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092").split(',')
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "social_media_content")

# Настройки парсера
PARSE_INTERVAL_SECONDS = int(os.getenv("PARSE_INTERVAL_SECONDS", 3600))
TRENDING_VIDEO_COUNT = int(os.getenv("TRENDING_VIDEO_COUNT", 30))

MS_TOKEN = os.getenv("MS_TOKEN")
TIKTOK_BROWSER = os.getenv("TIKTOK_BROWSER", "chromium")