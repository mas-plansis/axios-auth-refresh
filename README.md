# axios-auth-refresh

Модуль выполняет один запрос на обновление токена для всех одновременных запросов,
получивших заданный HTTP-статус. Это работает и для нескольких экземпляров Axios,
подключённых через одну копию библиотеки.

## Использование

```typescript
import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { axiosAuthRefresh } from '@plansis/axios-auth-refresh';

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: 'https://example.com/api',
});

const handleRefreshAuthCall = async () => {
  const response = await axiosInstance.post<TData>(
    '/refresh',
    {},
    { skipAuthRefresh: true },
  );

  return response;
};

const onRefreshSuccess = (res: AxiosResponse<TData>) => {
  console.log('success:', res);
};

const onRefreshError = (err: AxiosError<TError>) => {
  console.log('error:', err);
};

const interceptorId = axiosAuthRefresh<TData, TError>({
  axiosInstance,
  refreshAuthCall: handleRefreshAuthCall,
  onSuccess: onRefreshSuccess,
  onError: onRefreshError,
  options: {
    statusCodes: [401, 403],
    retryDelayMs: 300,
    maxRetryCount: 3,
    maxCallCount: 3,
  },
});

// При необходимости interceptor можно удалить.
axiosInstance.interceptors.response.eject(interceptorId);
```

`skipAuthRefresh: true` обязателен для запроса обновления токена, если он
выполняется тем же экземпляром Axios. Это защищает от повторного запуска
refresh-механизма.

## Настройки

- `statusCodes` задаёт HTTP-статусы, при которых выполняется обновление токена.
- `retryDelayMs` задаёт задержку между неудачными попытками обновления.
- `maxRetryCount` задаёт количество попыток обновления в одном цикле.
- `maxCallCount` задаёт дополнительный верхний предел вызовов refresh-функции. Фактическое количество попыток равно меньшему из `maxRetryCount` и `maxCallCount`.

После успешного обновления исходные запросы выполняются повторно один раз. Если
повторный запрос снова получает контролируемый статус, вызывается `onError`, а
новый цикл обновления для него не запускается.

