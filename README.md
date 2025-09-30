# 📝 Todo Application с Real-time обновлениями

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 🚀 Описание

Полнофункциональное Todo приложение на NestJS с аутентификацией, файловым хранилищем, real-time обновлениями через WebSocket и автоматической документацией API.

## ✨ Функциональность

### 🔐 Аутентификация и авторизация
- JWT аутентификация с безопасным хешированием паролей (bcrypt)
- Регистрация и вход пользователей
- Защищенные endpoints через JWT Guards
- WebSocket аутентификация для real-time функций

### 📋 Управление задачами (CRUD)
- Создание, чтение, обновление и удаление задач
- Фильтрация по статусу, приоритету и дате
- Поиск по названию и описанию
- Пагинация результатов
- Приоритеты: `low`, `medium`, `high`
- Сроки выполнения и статус завершения

### 📎 Файловое хранилище
- Загрузка файлов к задачам (изображения и PDF)
- Валидация типов файлов и размера (до 5MB)
- Безопасное скачивание файлов
- Автоматическая очистка при удалении задач

### 🔄 Real-time обновления (WebSocket)
- Мгновенные уведомления о создании/обновлении/удалении задач
- JWT аутентификация для WebSocket соединений
- События только для владельцев задач

### 📚 Автоматическая документация
- **Swagger/OpenAPI** документация: `http://localhost:3000/api`
- Интерактивное тестирование API
- Автоматическая валидация запросов
- Единообразные ответы API

### 🛡️ Обработка ошибок и валидация
- Глобальная обработка исключений
- Детальная валидация входных данных
- Кастомные исключения с понятными сообщениями
- Структурированные ответы API

## 🏁 Быстрый старт

### Предварительные требования
- **Node.js** >= 16
- **PostgreSQL** >= 12
- **Yarn** package manager

### 1. Клонирование и установка

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd todo-app

# Установите зависимости
yarn install
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL:

```sql
-- Подключитесь к PostgreSQL
psql -U postgres

-- Создайте базу данных
CREATE DATABASE todo_app;

-- Создайте пользователя (опционально)
CREATE USER todo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE todo_app TO todo_user;
```

### 3. Переменные окружения

Создайте `.env` файл в корне проекта:

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=todo_app

# JWT настройки
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Окружение
NODE_ENV=development
PORT=3000
```

> ⚠️ **Важно**: В продакшне обязательно измените `JWT_SECRET` на криптографически стойкий ключ!

### 4. Запуск приложения

```bash
# Режим разработки с автоперезагрузкой
yarn start:dev

# Продакшн режим
yarn build
yarn start:prod
```

Приложение будет доступно по адресам:
- **API**: `http://localhost:3000/api`
- **Swagger документация**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:3000/socket.io/`

## 📖 API Документация

### 🔗 Swagger/OpenAPI
Полная интерактивная документация доступна по адресу: **`http://localhost:3000/api`**

### 🔐 Аутентификация

#### Регистрация пользователя
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "john_doe"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "john_doe",
      "createdAt": "2025-09-30T10:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Ресурс успешно создан"
}
```

#### Вход в систему
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 📋 Управление задачами

> 🔒 Все endpoints требуют аутентификации через `Authorization: Bearer <token>`

#### Получить список задач
```http
GET /api/todos?page=1&limit=10&completed=false&priority=high&search=NestJS
Authorization: Bearer <jwt_token>
```

**Параметры запроса:**
- `page` - номер страницы (по умолчанию: 1)
- `limit` - количество задач на странице (по умолчанию: 10)
- `completed` - фильтр по статусу (true/false)
- `priority` - фильтр по приоритету (low/medium/high)
- `search` - поиск в названии и описании
- `dueDateFrom` / `dueDateTo` - фильтр по датам
- `sortBy` - поле сортировки (createdAt/dueDate/priority/title)
- `sortOrder` - направление сортировки (ASC/DESC)

#### Создать задачу
```http
POST /api/todos
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Изучить NestJS",
  "description": "Пройти документацию и создать проект",
  "priority": "high",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

#### Обновить задачу
```http
PATCH /api/todos/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "completed": true,
  "priority": "medium"
}
```

#### Переключить статус выполнения
```http
PATCH /api/todos/:id/complete
Authorization: Bearer <jwt_token>
```

#### Удалить задачу
```http
DELETE /api/todos/:id
Authorization: Bearer <jwt_token>
```

### 📎 Работа с файлами

#### Загрузить файл к задаче
```http
POST /api/files/upload/:todoId
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <binary_data>
```

**Поддерживаемые форматы:**
- Изображения: JPEG, PNG, GIF, WebP
- Документы: PDF
- Максимальный размер: 5MB

#### Скачать файл
```http
GET /api/files/:fileId
Authorization: Bearer <jwt_token>
```

#### Получить файлы задачи
```http
GET /api/todos/:todoId/files
Authorization: Bearer <jwt_token>
```

#### Удалить файл
```http
DELETE /api/files/:fileId
Authorization: Bearer <jwt_token>
```

## 🔄 WebSocket Real-time обновления

### Подключение

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
    auth: { token: 'your-jwt-token' }
});

// Присоединиться к real-time обновлениям
socket.emit('join');
```

### События

```javascript
// Подтверждение подключения
socket.on('joined', (data) => {
    console.log('Подключен:', data.user);
});

// Новая задача создана
socket.on('todo:created', (todo) => {
    console.log('Создана задача:', todo);
});

// Задача обновлена
socket.on('todo:updated', (todo) => {
    console.log('Обновлена задача:', todo);
});

// Задача удалена
socket.on('todo:deleted', (data) => {
    console.log('Удалена задача:', data.id);
});

// Задача завершена
socket.on('todo:completed', (todo) => {
    console.log('Завершена задача:', todo);
});

// Ошибки
socket.on('error', (error) => {
    console.error('Ошибка WebSocket:', error);
});
```

## 🏗️ Архитектура приложения

### Модульная структура

```
src/
├── common/                     # Общие компоненты
│   ├── decorators/            # Кастомные декораторы (@CurrentUser)
│   ├── dto/                   # Data Transfer Objects
│   ├── exceptions/            # Кастомные исключения
│   ├── filters/               # Exception filters
│   ├── guards/                # Auth guards (JWT, WebSocket)
│   ├── interceptors/          # Response interceptors
│   └── pipes/                 # Validation pipes
├── config/                    # Конфигурационные файлы
│   ├── database.config.ts     # Настройки БД
│   └── multer.config.ts       # Настройки загрузки файлов
├── database/                  # Database module
└── modules/                   # Функциональные модули
    ├── auth/                  # Аутентификация
    ├── users/                 # Управление пользователями
    ├── todos/                 # Управление задачами
    ├── files/                 # Файловое хранилище
    └── websocket/             # Real-time обновления
```

### Технологический стек

- **Backend**: NestJS, TypeScript
- **База данных**: PostgreSQL с Sequelize ORM
- **Аутентификация**: JWT tokens, bcrypt
- **Валидация**: class-validator, class-transformer
- **Файлы**: Multer для загрузки
- **Real-time**: Socket.IO WebSocket
- **Документация**: Swagger/OpenAPI
- **Тестирование**: Jest

### Безопасность

- ✅ JWT токены для аутентификации
- ✅ Bcrypt для хеширования паролей
- ✅ Валидация всех входных данных
- ✅ Авторизация на уровне ресурсов
- ✅ CORS настройки
- ✅ Файловая валидация
- ✅ Защита WebSocket соединений

## 🧪 Тестирование

```bash
# Юнит тесты
yarn test

# E2E тесты
yarn test:e2e

# Покрытие кода
yarn test:cov

# Тесты в watch режиме
yarn test:watch
```

## 📊 Форматы ответов API

### Успешный ответ
```json
{
  "success": true,
  "data": { /* данные */ },
  "message": "Запрос выполнен успешно"
}
```

### Ответ с ошибкой
```json
{
  "success": false,
  "data": null,
  "error": {
    "statusCode": 400,
    "message": "Ошибка валидации",
    "timestamp": "2025-09-30T10:00:00Z",
    "path": "/api/todos",
    "errors": {
      "title": ["не должно быть пустым"],
      "email": ["должен быть корректным email"]
    }
  }
}
```

### Пагинация
```json
{
  "success": true,
  "data": {
    "todos": [/* массив задач */],
    "total": 25,
    "page": 1,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🚀 Деплой

### Docker

Создайте `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копирование package files
COPY package*.json ./
COPY yarn.lock ./

# Установка зависимостей
RUN yarn install --frozen-lockfile --production

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN yarn build

# Создание пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Создание папки uploads
RUN mkdir uploads && chown -R nestjs:nodejs uploads

USER nestjs

EXPOSE 3000

CMD ["yarn", "start:prod"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_USERNAME=todo_user
      - DB_PASSWORD=secure_password
      - DB_NAME=todo_app
      - JWT_SECRET=your-production-secret
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=todo_app
      - POSTGRES_USER=todo_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Переменные для продакшена

```env
NODE_ENV=production
DB_HOST=your-db-host
DB_USERNAME=your-db-user
DB_PASSWORD=secure-password
DB_NAME=todo_app
JWT_SECRET=your-cryptographically-strong-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
```

## 🤝 Разработка

### Установка для разработки

```bash
# Клонирование
git clone <repo-url>
cd todo-app

# Установка всех зависимостей (включая dev)
yarn install

# Запуск в режиме разработки
yarn start:dev
```

### Код стайл

```bash
# Проверка линтера
yarn lint

# Исправление ошибок линтера
yarn lint:fix

# Форматирование кода
yarn format
```

### Полезные команды

```bash
# Генерация нового модуля
nest generate module feature-name

# Генерация контроллера
nest generate controller feature-name

# Генерация сервиса  
nest generate service feature-name

# Информация о проекте
nest info
```

## 🐛 Troubleshooting

### Частые проблемы

**База данных не подключается:**
- Проверьте что PostgreSQL запущен
- Убедитесь в правильности данных в `.env`
- Проверьте существование базы данных

**WebSocket не подключается:**
- Убедитесь что JWT токен валиден
- Проверьте CORS настройки
- Проверьте что порт 3000 доступен

**Файлы не загружаются:**
- Проверьте права доступа к папке `uploads/`
- Убедитесь что тип файла поддерживается
- Проверьте размер файла (максимум 5MB)

### Логирование

Для отладки включите подробное логирование:

```env
NODE_ENV=development
```

## 📝 Лицензия

MIT License - см. файл [LICENSE](./LICENSE).

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

<p align="center">
  Сделано с ❤️ на <a href="https://nestjs.com/" target="_blank">NestJS</a>
</p>