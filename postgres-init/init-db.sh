#!/bin/bash
set -e # Прерывать скрипт при любой ошибке

# Выполняем SQL-команду с помощью 'psql'.
# Переменные $POSTGRES_USER и $POSTGRES_DB берутся из окружения контейнера.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE virality_analyzer_service_db;
    CREATE DATABASE user_service_db;
EOSQL