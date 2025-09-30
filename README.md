# 📝 Todo Application с Real-time обновлениями

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Описание

Полнофункциональное Todo приложение на NestJS с аутентификацией, файловым хранилищем и real-time обновлениями через WebSocket.

## ✨ Функциональность

### 🔐 Аутентификация и авторизация
- JWT аутентификация
- Регистрация и вход пользователей
- Защищенные endpoints с guards
- Хеширование паролей через bcrypt

### 📋 Управление Todo
- CRUD операции для todos
- Фильтрация и пагинация
- Приоритеты задач (low, medium, high)
- Сроки выполнения
- Статус завершения

### 📎 Файловое хранилище
- Загрузка файлов к todos
- Поддержка изображений и PDF
- Валидация типов файлов
- Автоматическая очистка при удалении

### 🔄 Real-time обновления
- WebSocket соединения с JWT аутентификацией
- Мгновенные уведомления о изменениях
- События: создание, обновление, удаление, завершение todos

## 🚀 Установка и запуск

### Предварительные требования
- Node.js >= 16
- PostgreSQL
- Yarn package manager

### 1. Установка зависимостей
```bash
yarn install
```

### 2. Настройка окружения
Создайте `.env` файл в корневом каталоге:

```env
# Конфигурация базы данных
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=todo_app

# JWT конфигурация
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Окружение
NODE_ENV=development
```

### 3. Настройка базы данных
Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE todo_app;
```

### 4. Запуск приложения

```bash
# Режим разработки с автоперезагрузкой
yarn start:dev

# Продакшн режим
yarn build
yarn start:prod
```

Приложение будет доступно по адресу: `http://localhost:3000`

## 📚 API Документация

### Аутентификация

#### Регистрация
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "testuser"
}
```

#### Вход
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Todo операции

#### Получение всех todos
```http
GET /todos?page=1&limit=10&completed=false&priority=high
Authorization: Bearer <jwt_token>
```

#### Создание todo
```http
POST /todos
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Изучить NestJS",
  "description": "Пройти документацию",
  "priority": "high",
  "dueDate": "2025-10-15T10:00:00Z"
}
```

#### Обновление todo
```http
PATCH /todos/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "completed": true,
  "priority": "medium"
}
```

#### Переключение статуса завершения
```http
PATCH /todos/:id/complete
Authorization: Bearer <jwt_token>
```

### Файловые операции

#### Загрузка файла
```http
POST /files/upload/:todoId
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <file_data>
```

#### Скачивание файла
```http
GET /files/:id
Authorization: Bearer <jwt_token>
```

#### Получение файлов todo
```http
GET /todos/:todoId/files
Authorization: Bearer <jwt_token>
```

## 🔄 WebSocket Events

### Подключение
```javascript
const socket = io('http://localhost:3000', {
    auth: { token: 'your-jwt-token' }
});

socket.emit('join');
```

### События
- `todo:created` - новый todo создан
- `todo:updated` - todo обновлен  
- `todo:deleted` - todo удален
- `todo:completed` - todo завершен

Подробная документация: [WEBSOCKET_DOCUMENTATION.md](./WEBSOCKET_DOCUMENTATION.md)

## 🏗️ Архитектура

### Модули
- **AuthModule** - аутентификация и авторизация
- **UsersModule** - управление пользователями
- **TodosModule** - CRUD операции для todos
- **FilesModule** - файловое хранилище
- **WebSocketModule** - real-time обновления

### База данных
- **PostgreSQL** с Sequelize ORM
- Автоматические миграции
- Связи между сущностями

### Безопасность
- JWT токены для аутентификации
- Bcrypt для хеширования паролей
- Валидация входных данных
- CORS настройки
- Проверка прав доступа

## 🧪 Тестирование

```bash
# Юнит тесты
yarn test

# E2E тесты
yarn test:e2e

# Покрытие кода
yarn test:cov
```

## 📁 Структура проекта

```
src/
├── common/                 # Общие компоненты
│   ├── decorators/         # Декораторы
│   ├── dto/               # DTOs
│   └── guards/            # Guards
├── config/                # Конфигурация
├── database/              # Настройки БД
└── modules/               # Функциональные модули
    ├── auth/              # Аутентификация
    ├── users/             # Пользователи
    ├── todos/             # Todos
    ├── files/             # Файлы
    └── websocket/         # WebSocket
```

## 🔧 Разработка

### Код стайл
Проект использует ESLint и Prettier для форматирования кода:

```bash
yarn lint
yarn format
```

### Переменные окружения
Все конфигурации вынесены в переменные окружения для удобства деплоя.

### Логирование
Используется встроенная система логирования NestJS.

## 🚀 Деплой

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --production
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start:prod"]
```

### Переменные для продакшена
- Измените `JWT_SECRET` на криптографически стойкий ключ
- Настройте подключение к продакшн БД
- Обновите CORS настройки для вашего домена

## 📄 Лицензия

MIT License