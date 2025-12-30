import json
import random
import time
from datetime import datetime, timedelta, timezone
from kafka import KafkaProducer
import uuid
from app.core import config
from app.core.kafka_producer import MediaContentProducer

# --- НАСТРОЙКИ ---
KAFKA_BROKER = "localhost:9092"
KAFKA_TOPIC = "social_media_content"
ACTORS_FILE = "./scripts/actors.json"

DAYS_OF_HISTORY = 3
HOURS_INTERVAL = 1

def get_linear_delta(current_value, max_value, step, total_steps):
    """Равномерный прирост на каждом шаге."""
    base_increment = (max_value / total_steps) * 0.1
    return base_increment * random.uniform(0.5, 1.5)

def get_viral_delta(current_value, max_value, step, total_steps):
    """Большой прирост в середине, потом затухание."""
    progress = step / total_steps
    factor = 4 * progress * (1 - progress)
    base_increment = (max_value / total_steps) * 2
    return base_increment * factor * random.uniform(0.8, 1.2)

def get_stagnation_delta(current_value, max_value, step, total_steps):
    """Почти без роста (стагнация)."""
    if random.random() < 0.8:
        return random.randint(0, 10)
    base_increment = (max_value / total_steps) * 0.01
    return base_increment * random.uniform(1, 5)

DELTA_FUNCTIONS = [get_linear_delta, get_viral_delta, get_stagnation_delta]

def main():
    print("🚀 Запуск Seeder'а... Отправляем историю в Kafka.")
    producer = MediaContentProducer(config.KAFKA_BOOTSTRAP_SERVERS)

    with open(ACTORS_FILE, 'r') as f:
        actors = json.load(f)

    if not actors:
        print("❌ actors.json пуст! Нечего генерировать.")
        return

    print(f"✅ Загружено {len(actors)} видео-актеров. Начинаем генерацию...")

    now = datetime.now(timezone.utc)
    total_snapshots_generated = 0

    for video_actor in actors:
        video_id = video_actor.get("_id")
        print(f"  -> Генерация для видео: {video_id}")

        final_stats = video_actor.get("stats", {})
        if not final_stats:
            continue

        delta_func = random.choice(DELTA_FUNCTIONS)
        total_steps = (DAYS_OF_HISTORY * 24) // HOURS_INTERVAL

        # --- ГЛАВНАЯ МАГИЯ: НАКОПИТЕЛЬНЫЙ РОСТ ---
        # 1. Начинаем с небольшого случайного % от финальных значений
        current_stats = {
            "views": int(final_stats.get("views", 0) * random.uniform(0.01, 0.05)),
            "likes": int(final_stats.get("likes", 0) * random.uniform(0.01, 0.05)),
            "comments": int(final_stats.get("comments", 0) * random.uniform(0.01, 0.05)),
            "shares": int(final_stats.get("shares", 0) * random.uniform(0.01, 0.05)),
        }

        for step in range(total_steps):
            snapshot_time = now - timedelta(hours=(total_steps - step - 1) * HOURS_INTERVAL)

            # --- СОБИРАЕМ СООБЩЕНИЕ ПО ТВОЕМУ КОНТРАКТУ ---
            message = {
                "source": video_actor.get("source"),
                "event_time": snapshot_time.isoformat(),
                "data_type": "video",
                "payload": {
                    "platform_id": video_actor.get("_id"),
                    "description": video_actor.get("title"),
                    "published_at": video_actor.get("published_at"),
                    "url": video_actor.get("url"),
                    "stats": current_stats,
                    "content_meta": {
                        "duration": video_actor.get("duration"),
                        "hashtags": video_actor.get("hashtags", [])
                    },
                    "author": video_actor.get("author")
                }
            }

            # Отправляем в Kafka
            producer.send_message(KAFKA_TOPIC, message)
            total_snapshots_generated += 1

            current_stats["views"] += int(
                delta_func(current_stats["views"], final_stats.get("views", 0), step, total_steps))
            current_stats["likes"] += int(
                delta_func(current_stats["likes"], final_stats.get("likes", 0), step, total_steps) * 0.5)
            current_stats["comments"] += int(
                delta_func(current_stats["comments"], final_stats.get("comments", 0), step, total_steps) * 0.2)
            current_stats["shares"] += int(
                delta_func(current_stats["shares"], final_stats.get("comments", 0), step, total_steps) * 0.3)

            # Гарантия, что мы не превысим финальное значение (на всякий случай)
            current_stats["views"] = min(current_stats["views"], final_stats.get("views", 0))
            current_stats["likes"] = min(current_stats["likes"], final_stats.get("likes", 0))

    producer.flush()  # Гарантируем, что все сообщения отправлены
    print(f"\n✅ Генерация завершена. Отправлено {total_snapshots_generated} снапшотов в Kafka.")


if __name__ == "__main__":
    main()

# poetry run python -m scripts.seed_database