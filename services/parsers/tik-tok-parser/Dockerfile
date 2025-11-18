# Этап 1: Используем официальный образ Python
FROM python:3.12.1

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем схемы для schema registry
COPY contracts/schemas /app/contracts/schemas

# Копируем файл с зависимостями
COPY requirements.txt .

# Устанавливаем зависимости
# --no-cache-dir уменьшает размер образа
RUN pip install --no-cache-dir -r requirements.txt

# Устанавливаем движки для Playwright (необходимы для TikTokApi)
RUN python -m playwright install chromium --with-deps

# Копируем исходный код нашего приложения
COPY services/parsers/tik-tok-parser/src/ ./src/
COPY services/parsers/tik-tok-parser/main.py .

# Команда для запуска нашего приложения при старте контейнера
# python -u: отключает буферизацию вывода, чтобы логи сразу появлялись в Docker logs
CMD ["python", "-u", "main.py"]