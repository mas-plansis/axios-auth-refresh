import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
export type AxiosAuthRefreshOptions = {
    /** Количество попыток обновления токена в одном цикле */
    maxRetryCount: number;
    /** Задержка применяемая перед следующей попыткой выполнения запроса в мс */
    retryDelayMs: number;
    /** Коды состояния для которых отработает перехватчик */
    statusCodes: Array<number>;
    /** Максимальное количество попыток обновления токена */
    maxCallCount: number;
};
export type AxiosAuthRefreshProps<TData = unknown, TError = unknown> = {
    axiosInstance: AxiosInstance;
    refreshAuthCall: () => Promise<AxiosResponse<TData>>;
    onSuccess?: (res: AxiosResponse<TData>) => void;
    onError?: (err: AxiosError<TError>) => void;
    options?: Partial<AxiosAuthRefreshOptions>;
};
export declare const axiosAuthRefresh: <TData = unknown, TError = unknown>(props: AxiosAuthRefreshProps<TData, TError>) => number;
