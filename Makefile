up:
	docker compose up -d
up-build:
	docker compose up -d --build
down:
	docker compose down
down-v:
	docker compose down -v
rebuild:
	docker compose up -d --build --no-deps $(service)
.PHONY: up up-build down down-v rebuild