FROM golang:1.23-alpine AS development

WORKDIR /app

RUN go install github.com/cosmtrek/air@v1.40.4

COPY go.mod go.sum ./
RUN go mod download

COPY . .

CMD ["air"]


FROM alpine:latest AS production
WORKDIR /app
COPY --from=development /app/go.mod ./
COPY --from=development /app/go.sum ./
RUN go mod download
COPY --from=development /app .
RUN go build -o /main ./cmd/main.go

ENTRYPOINT ["/main"]