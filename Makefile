up:
	docker compose up -d
up-build:
	docker compose up -d --build
	@echo "Очистка <none> образов"
	@docker image prune -f
down:
	docker compose down
down-v:
	docker compose down -v
rebuild:
	docker compose up -d --build --no-deps $(service)
	@echo "Очистка <none> образов после пересборки..."
	@docker image prune -f
.PHONY: up up-build down down-v rebuild