package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"virality-analyzer-service/internal/domain"
	"virality-analyzer-service/internal/storage"

	"github.com/segmentio/kafka-go"
)

type MessageConsumer struct {
	reader     *kafka.Reader
	repository storage.SnapshotRepository
}

func NewMessageConsumer(brokers []string, topic string, repo storage.SnapshotRepository) *MessageConsumer {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: brokers,
		Topic:   topic,
		GroupID: "virality-analyzer-group",
	})
	return &MessageConsumer{
		reader:     reader,
		repository: repo,
	}
}

func (c *MessageConsumer) Run(ctx context.Context) {
	defer c.reader.Close()
	log.Println("Консьюмер запущен, ожидание сообщений...")

	for {
		msg, err := c.reader.ReadMessage(ctx)
		if err != nil {
			log.Printf("Ошибка при чтении сообщения: %v", err)
			continue
		}

		var message domain.SocialMediaMessage
		if err := json.Unmarshal(msg.Value, &message); err != nil {
			log.Printf("Ошибка разбора JSON: %v. Сообщение: %s", err, string(msg.Value))
			continue
		}

		if err := c.repository.SaveSnapshot(ctx, &message); err != nil {
			log.Printf("Ошибка обработки сообщения: %v", err)
		}
	}
}

func CheckKafkaConnection(ctx context.Context, brokers []string, topic string) error {
	log.Println("Проверка соединения с Kafka...")

	for _, broker := range brokers {
		// kafka.DialLeader - это низкоуровневый способ установить соединение
		// с лидером партиции для конкретного топика.
		// Мы используем его здесь как надежный "пинг".
		// Устанавливаем короткий таймаут, чтобы не ждать вечно.
		dialer := &kafka.Dialer{
			Timeout:   3 * time.Second,
			DualStack: true,
		}

		conn, err := dialer.DialContext(ctx, "tcp", broker)
		if err != nil {
			log.Printf("Не удалось подключиться к брокеру %s: %v. Пробую следующий...", broker, err)
			continue
		}

		defer conn.Close()

		// Теперь, когда соединение с брокером есть, спросим у него про наш топик.
		partitions, err := conn.ReadPartitions(topic)
		if err != nil {
			return fmt.Errorf("не удалось получить информацию о топике '%s' от брокера %s: %w", topic, broker, err)
		}

		// Если мы получили информацию хотя бы об одной партиции, значит топик существует.
		if len(partitions) == 0 {
			return fmt.Errorf("топик '%s' существует на брокере %s, но у него нет партиций", topic, broker)
		}

		log.Printf("Успешное соединение с брокером Kafka: %s. Топик '%s' найден.", broker, topic)
		return nil
	}

	return fmt.Errorf("не удалось подключиться ни к одному из указанных Kafka-брокеров")
}
