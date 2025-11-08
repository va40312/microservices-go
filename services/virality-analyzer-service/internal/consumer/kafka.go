package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"virality-analyzer-service/internal/domain"
	"virality-analyzer-service/internal/storage" // <-- Импортируем наш репозиторий

	"github.com/segmentio/kafka-go"
)

type MessageConsumer struct {
	reader     *kafka.Reader
	repository storage.SnapshotRepository // <-- Зависимость от интерфейса, а не от конкретной БД!
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

// Run запускает бесконечный цикл прослушивания сообщений.
func (c *MessageConsumer) Run(ctx context.Context) {
	defer c.reader.Close()
	log.Println("Консьюмер запущен, ожидание сообщений...")

	for {
		msg, err := c.reader.ReadMessage(ctx)
		if err != nil {
			log.Printf("Ошибка при чтении сообщения: %v", err)
			continue
		}

		var message domain.TikTokMessage
		if err := json.Unmarshal(msg.Value, &message); err != nil {
			log.Printf("Ошибка разбора JSON: %v. Сообщение: %s", err, string(msg.Value))
			continue
		}

		// Используем репозиторий для сохранения, не зная, какая там внутри БД.
		if err := c.repository.SaveSnapshot(ctx, &message); err != nil {
			log.Printf("Ошибка обработки сообщения: %v", err)
			// Здесь можно добавить логику повторов или отправки в DLQ (Dead Letter Queue)
		}
	}
}

func CheckKafkaConnection(ctx context.Context, brokers []string, topic string) error {
	log.Println("Проверка соединения с Kafka...")

	// Попытаемся подключиться к каждому брокеру по очереди.
	// Если хотя бы один ответит и подтвердит наличие топика, считаем проверку успешной.
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

		// Важно закрыть соединение после проверки
		defer conn.Close()

		// Теперь, когда соединение с брокером есть, спросим у него про наш топик.
		partitions, err := conn.ReadPartitions(topic)
		if err != nil {
			// Это может означать, что топик не существует, или другие проблемы
			return fmt.Errorf("не удалось получить информацию о топике '%s' от брокера %s: %w", topic, broker, err)
		}

		// Если мы получили информацию хотя бы об одной партиции, значит топик существует.
		if len(partitions) == 0 {
			return fmt.Errorf("топик '%s' существует на брокере %s, но у него нет партиций", topic, broker)
		}

		// Успех! Мы подключились к брокеру и убедились, что топик существует.
		log.Printf("Успешное соединение с брокером Kafka: %s. Топик '%s' найден.", broker, topic)
		return nil // Выходим из функции с результатом "успех"
	}

	// Если мы прошли весь цикл и не смогли подключиться ни к одному брокеру
	return fmt.Errorf("не удалось подключиться ни к одному из указанных Kafka-брокеров")
}
