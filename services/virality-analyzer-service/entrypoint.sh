#!/bin/sh
set -e

# Шаг 1: Запускаем вспомогательную команду
migrate -path db/migrations -database "$DATABASE_URL" up

# Шаг 2: Запускаем основную точку входа с помощью 'exec'
exec air