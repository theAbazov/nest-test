# Multi-stage build для оптимизации размера образа

# Dependencies stage
FROM node:20-alpine AS dependencies

WORKDIR /app

# Обновляем Alpine и устанавливаем необходимые системные пакеты
RUN apk update && apk upgrade && apk add --no-cache curl

# Копируем package files для установки зависимостей
COPY package*.json ./
COPY yarn.lock ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN yarn install --frozen-lockfile

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Устанавливаем необходимые системные пакеты для разработки
RUN apk update && apk upgrade && apk add --no-cache curl bash

# Копируем все зависимости
COPY --from=dependencies /app/node_modules ./node_modules

# Копируем исходный код
COPY . .

# Создаем папку для загруженных файлов
RUN mkdir -p uploads

# Открываем порты для разработки
EXPOSE 3000 9229

# Запускаем в режиме разработки
CMD ["yarn", "start:dev"]

# Build stage
FROM dependencies AS build

WORKDIR /app

# Копируем исходный код
COPY . .

# Собираем приложение
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Устанавливаем curl для health check и обновляем систему
RUN apk update && apk upgrade && apk add --no-cache curl

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Копируем package files
COPY package*.json ./
COPY yarn.lock ./

# Устанавливаем только production зависимости
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Копируем собранное приложение
COPY --from=build /app/dist ./dist

# Копируем health check скрипт
COPY --from=build /app/src/health-check.js ./dist/

# Создаем папку для загруженных файлов
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Меняем владельца файлов
RUN chown -R nestjs:nodejs /app
USER nestjs

# Открываем порт
EXPOSE 3000


# Запускаем приложение
CMD ["node", "dist/main"]
