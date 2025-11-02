### Проект Trendy

### Цель проекта: 

Платформа для мониторинга и анализа медиаконтента из социальных сетей сетей  как youtube.com, tiktok.com.

---
### Как запустить:

Запустить контейнеры:
```bash
docker compose up -d
```

Установить migrate
``` bash
go install -tags="postgres" github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```
Запустить миграции
```bash
migrate -path ./db/migrations -database "postgresql://user:password@localhost:5432/user_service_db" up 
```

Установить переменные окружения перед запуском
`DATABASE_URL` и `JWT_SECRET` и `APP_ENV`

