# За основу берем официальный образ, чтобы не терять его функциональность
FROM confluentinc/cp-kafka:8.1.0

# 1. Временно переключаемся на пользователя ROOT
USER root

# Копируем наши скрипты в контейнер
COPY create-topics.sh /usr/bin/create-topics.sh
COPY entrypoint.sh /usr/bin/entrypoint.sh

# Даем им права на исполнение
RUN chmod +x /usr/bin/create-topics.sh /usr/bin/entrypoint.sh

# 4. ВАЖНО! Возвращаемся обратно к непривилегированному пользователю.
#    Для этого образа используется пользователь с ID 1001.
USER 1001

# Назначаем НАШ скрипт-дирижер точкой входа
ENTRYPOINT ["/usr/bin/entrypoint.sh"]