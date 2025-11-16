#!/bin/sh
set -e

echo 'Ожидание, пока брокер Kafka станет доступен...'
while ! kafka-topics --list --bootstrap-server localhost:29092 > /dev/null 2>&1; do
  sleep 1
done
echo 'Kafka готова к работе!'
kafka-topics --create --if-not-exists --topic social_media_content --bootstrap-server localhost:29092 --partitions 1 --replication-factor 1
echo 'Топик social_media_content успешно создан или уже существует.'