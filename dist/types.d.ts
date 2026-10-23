import type { AxiosRequestConfig } from 'axios';
declare module 'axios' {
    interface AxiosRequestConfig {
        /** Пропустить обновление токена для этого запроса. */
        skipAuthRefresh?: boolean;
    }
}
export type AxiosAuthRefreshRequestConfig<D = unknown> = {
    /**
     * @example
     * // Есть возможность пропустить логику перехватчика для конкретных вызовов.
     * // Для этого нужно передать в конфиг запроса опцию skipAuthRefresh
     * // для каждого запроса, который не нужно перехватывать.
     * axios.get('https://www.example.com/', { skipAuthRefresh: true });
     */
    skipAuthRefresh?: boolean;
} & AxiosRequestConfig<D>;
