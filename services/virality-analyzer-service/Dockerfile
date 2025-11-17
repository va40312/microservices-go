# Образ для РАЗРАБОТКИ (с live reload)
FROM golang:1.18.10-alpine AS development

WORKDIR /app

RUN go install github.com/cosmtrek/air@v1.40.4

RUN go install -tags="postgres" github.com/golang-migrate/migrate/v4/cmd/migrate@v4.17.1

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Даем нашему скрипту права на исполнение. Без этого Docker не сможет его запустить.
RUN chmod +x ./entrypoint.sh

# Указываем Docker, что наш скрипт является точкой входа в контейнер.
# Он будет запущен вместо стандартной оболочки.
ENTRYPOINT ["./entrypoint.sh"]

FROM alpine:latest AS production
WORKDIR /app
COPY --from=development /app/go.mod ./
COPY --from=development /app/go.sum ./
RUN go mod download
COPY --from=development /app .
RUN go build -o /main ./cmd/main.go
ENTRYPOINT ["/main"]