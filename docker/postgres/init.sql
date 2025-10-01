-- ==============================================
-- PostgreSQL Database Initialization Script
-- ==============================================

-- Создание расширений для PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание индексов для оптимизации производительности
-- (будут созданы автоматически через Sequelize, но можно добавить дополнительные)

-- Настройка параметров базы данных для оптимальной производительности
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Создание роли для мониторинга (опционально)
CREATE USER monitoring WITH PASSWORD 'monitoring_password';
GRANT CONNECT ON DATABASE todo_app TO monitoring;
GRANT USAGE ON SCHEMA public TO monitoring;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring;

-- Сообщение об успешной инициализации
\echo 'Database initialization completed successfully!'
