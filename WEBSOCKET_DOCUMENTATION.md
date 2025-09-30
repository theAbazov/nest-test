# 📡 WebSocket Real-time обновления - Документация

## Обзор

WebSocket модуль предоставляет real-time обновления для todo приложения. Пользователи получают мгновенные уведомления о изменениях в их todos без перезагрузки страницы.

## Настройка подключения

### URL подключения
```
ws://localhost:3000/socket.io/
```

### Аутентификация

WebSocket требует JWT токен для аутентификации. Токен можно передать несколькими способами:

#### 1. Через auth объект (рекомендуется)
```javascript
const socket = io('http://localhost:3000', {
    auth: {
        token: 'your-jwt-token-here'
    }
});
```

#### 2. Через query параметры
```javascript
const socket = io('http://localhost:3000', {
    query: {
        token: 'Bearer your-jwt-token-here'
    }
});
```

#### 3. Через заголовки
```javascript
const socket = io('http://localhost:3000', {
    extraHeaders: {
        authorization: 'Bearer your-jwt-token-here'
    }
});
```

## События

### Client → Server

#### `join`
Подключение пользователя к real-time обновлениям.

```javascript
socket.emit('join');
```

**Ответ:**
```javascript
socket.on('joined', (data) => {
    console.log('Подключен:', data);
    // {
    //   message: "Successfully connected to real-time updates",
    //   user: {
    //     id: "user-uuid",
    //     username: "username",
    //     email: "user@example.com"
    //   }
    // }
});
```

### Server → Client

#### `todo:created`
Отправляется когда создается новый todo.

```javascript
socket.on('todo:created', (todo) => {
    console.log('Новый TODO:', todo);
});
```

**Пример данных:**
```json
{
    "id": "todo-uuid",
    "title": "Новая задача",
    "description": "Описание задачи",
    "completed": false,
    "priority": "medium",
    "dueDate": "2025-10-01T00:00:00.000Z",
    "userId": "user-uuid",
    "createdAt": "2025-09-30T10:00:00.000Z",
    "updatedAt": "2025-09-30T10:00:00.000Z"
}
```

#### `todo:updated`
Отправляется когда обновляется todo.

```javascript
socket.on('todo:updated', (todo) => {
    console.log('TODO обновлен:', todo);
});
```

#### `todo:deleted`
Отправляется когда удаляется todo.

```javascript
socket.on('todo:deleted', (data) => {
    console.log('TODO удален:', data);
    // { id: "todo-uuid" }
});
```

#### `todo:completed`
Отправляется когда todo отмечается как завершенное.

```javascript
socket.on('todo:completed', (todo) => {
    console.log('TODO завершен:', todo);
});
```

#### Обработка ошибок

```javascript
socket.on('error', (error) => {
    console.error('WebSocket ошибка:', error);
});

socket.on('connect_error', (error) => {
    console.error('Ошибка подключения:', error);
});
```

## Примеры использования

### JavaScript (Vanilla)

```javascript
// Подключение с аутентификацией
const socket = io('http://localhost:3000', {
    auth: {
        token: localStorage.getItem('jwt_token')
    }
});

// Обработчики событий подключения
socket.on('connect', () => {
    console.log('Подключен к WebSocket');
    socket.emit('join'); // Присоединиться к обновлениям
});

socket.on('disconnect', () => {
    console.log('Отключен от WebSocket');
});

// Обработчики TODO событий
socket.on('todo:created', (todo) => {
    addTodoToList(todo); // Добавить в UI
});

socket.on('todo:updated', (todo) => {
    updateTodoInList(todo); // Обновить в UI
});

socket.on('todo:deleted', ({ id }) => {
    removeTodoFromList(id); // Удалить из UI
});

socket.on('todo:completed', (todo) => {
    markTodoAsCompleted(todo); // Отметить в UI
});
```

### React

```jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useTodoWebSocket = (token) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        const newSocket = io('http://localhost:3000', {
            auth: { token }
        });

        newSocket.on('connect', () => {
            setConnected(true);
            newSocket.emit('join');
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
        });

        // TODO события
        newSocket.on('todo:created', (todo) => {
            // Обновить состояние todos
        });

        newSocket.on('todo:updated', (todo) => {
            // Обновить todo в состоянии
        });

        newSocket.on('todo:deleted', ({ id }) => {
            // Удалить todo из состояния
        });

        newSocket.on('todo:completed', (todo) => {
            // Отметить todo как завершенное
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    return { socket, connected };
};
```

### Vue.js

```javascript
// composable/useWebSocket.js
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export function useWebSocket(token) {
    const socket = ref(null);
    const connected = ref(false);

    onMounted(() => {
        if (!token) return;

        socket.value = io('http://localhost:3000', {
            auth: { token }
        });

        socket.value.on('connect', () => {
            connected.value = true;
            socket.value.emit('join');
        });

        socket.value.on('disconnect', () => {
            connected.value = false;
        });

        // TODO события
        socket.value.on('todo:created', (todo) => {
            // Логика обновления
        });
    });

    onUnmounted(() => {
        if (socket.value) {
            socket.value.disconnect();
        }
    });

    return { socket, connected };
}
```

## CORS настройки

WebSocket настроен для работы с следующими origin:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Для production обновите настройки CORS в `websocket.gateway.ts`:

```typescript
@WebSocketGateway({
    cors: {
        origin: ['https://yourdomain.com'], // Ваш домен
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
```

## Безопасность

1. **JWT Аутентификация**: Все WebSocket соединения требуют действительный JWT токен
2. **Изоляция пользователей**: События отправляются только владельцу todo
3. **Валидация токенов**: Токены проверяются при каждом подключении
4. **Автоматическое отключение**: Недействительные токены автоматически отключаются

## Troubleshooting

### Проблемы с подключением

1. **Неверный токен**: Проверьте что JWT токен действителен и не истек
2. **CORS ошибки**: Убедитесь что ваш origin добавлен в настройки CORS
3. **Сеть**: Проверьте что порт 3000 доступен

### Отладка

Включите логирование в браузере:

```javascript
localStorage.debug = 'socket.io-client:socket';
```

### Тестирование

Используйте `websocket-client-example.html` для тестирования WebSocket подключения.

## Производительность

- **Оптимизированные события**: Отправка только необходимых данных
- **Управление памятью**: Автоматическая очистка отключенных соединений  
- **Обработка ошибок**: Graceful handling сетевых проблем
