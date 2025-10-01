# NestJS TODO API

## Запуск проекта

1. **Клонируйте репозиторий:**

   ```bash
   git clone https://github.com/theAbazov/nest-test.git
   cd nest-test
   ```

2. **Настройте переменные окружения:**

   ```bash
   cp docker.env.example .env
   ```

   Отредактируйте `.env` файл под ваши нужды.

3. **Запуск в режиме разработки:**

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

4. **Запуск в продакшн режиме:**
   ```bash
   docker-compose up --build
   ```

### Доступные сервисы

- **Swagger документация:** http://localhost:3000/api
- **WebSocket:** ws://localhost:3000

### Структура API

- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход в систему

- `GET /todos` - Получить список задач (фильтры и пагинация)
- `POST /todos` - Создать задачу
- `GET /todos/:id` - Получить задачу по ID
- `PATCH /todos/:id` - Обновить задачу
- `PATCH /todos/:id/complete` - Переключить статус выполнения задачи
- `DELETE /todos/:id` - Удалить задачу

- `POST /files/upload/:todoId` - Загрузить файл к задаче
- `GET /files/:id` - Скачать файл по ID
- `DELETE /files/:id` - Удалить файл
- `GET /todos/:todoId/files` - Получить файлы задачи

Все эндпоинты (кроме auth) требуют JWT токен в заголовке Authorization.

### Дополнительные файлы

- **websocket-client-example.html** - HTML-клиент для тестирования WebSocket соединения:
  - Позволяет подключиться к WebSocket серверу с JWT токеном
  - Отображает все события в реальном времени (создание/обновление/удаление задач)
  - Содержит UI для тестирования WebSocket функционала
  - Запустите файл в браузере для проверки WebSocket взаимодействия

- **nodemon.json** - Конфигурация для режима разработки:
  - Настраивает автоматическую перезагрузку приложения при изменении кода
  - Включает надёжное отслеживание изменений файлов в Docker на Windows/macOS
  - Используется при запуске в dev-режиме (`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`)

- **docker\postgres\init.sql**- это скрипт первичной настройки PostgreSQL, который выполняется один раз при создании базы данных и устанавливает:
  - нужные расширения (uuid, криптография)
  - параметры логирования
  - настройки производительности
