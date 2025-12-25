from kafka import KafkaProducer
import json
import logging

class MediaContentProducer:
    def __init__(self, bootstrap_servers):
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            logging.info(f"Успешно подключен к Kafka по адресу: {bootstrap_servers}")
        except Exception as e:
            logging.error(f"Не удалось подключиться к Kafka: {e}", exc_info=True)
            raise

    def send_message(self, topic: str, message: dict):
        """Отправляет одно сообщение в указанный топик."""
        try:
            platform_id = message.get("payload", {}).get("platform_id", "N/A")
            self.producer.send(topic, value=message)
            logging.debug(f"Сообщение {platform_id} отправлено в топик '{topic}'.")
        except Exception as e:
            logging.error(f"Ошибка при отправке сообщения в Kafka: {e}", exc_info=True)

    def flush(self):
        """Гарантирует доставку всех ожидающих сообщений."""
        self.producer.flush()