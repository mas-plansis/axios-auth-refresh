"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosAuthRefresh = void 0;
const utils_1 = require("./utils");
const defaultOptions = {
    statusCodes: [401],
    retryDelayMs: 300,
    maxRetryCount: 3,
    maxCallCount: 3,
};
let refreshPromise = null;
const refreshWithRetry = async (refreshAuthCall, options) => {
    const maxAttempts = Math.min(options.maxRetryCount, options.maxCallCount);
    let refreshError;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            return await refreshAuthCall();
        }
        catch (error) {
            refreshError = error;
            console.error(`Ошибка обновления токена: ${error instanceof Error ? error.message : String(error)}`);
            if (attempt + 1 < maxAttempts)
                await (0, utils_1.sleep)(options.retryDelayMs);
        }
    }
    console.error('Не удалось обновить токен после максимального количества попыток');
    throw refreshError ?? new Error('Количество попыток обновления токена равно 0');
};
const getRefreshPromise = (props, options) => {
    if (!refreshPromise) {
        const currentPromise = refreshWithRetry(props.refreshAuthCall, options);
        void currentPromise.then((response) => {
            try {
                props.onSuccess?.(response);
            }
            catch (error) {
                console.error('Ошибка обработчика успешного обновления токена', error);
            }
        }, (error) => {
            try {
                props.onError?.(error);
            }
            catch (callbackError) {
                console.error('Ошибка обработчика обновления токена', callbackError);
            }
        });
        refreshPromise = currentPromise;
        const resetRefreshPromise = () => {
            if (refreshPromise === currentPromise)
                refreshPromise = null;
        };
        void currentPromise.then(resetRefreshPromise, resetRefreshPromise);
    }
    return refreshPromise;
};
const axiosAuthRefresh = (props) => {
    const { axiosInstance, onError } = props;
    const options = {
        ...defaultOptions,
        ...props.options,
    };
    return axiosInstance.interceptors.response.use((response) => response, async (error) => {
        const requestConfig = error.config;
        const hasStatus = error.response !== undefined &&
            options.statusCodes.includes(error.response.status);
        if (!requestConfig || !hasStatus || requestConfig.skipAuthRefresh) {
            throw error;
        }
        if (requestConfig.retryAfterAuthRefresh) {
            try {
                onError?.(error);
            }
            catch (callbackError) {
                console.error('Ошибка обработчика обновления токена', callbackError);
            }
            throw error;
        }
        requestConfig.retryAfterAuthRefresh = true;
        await getRefreshPromise(props, options);
        return axiosInstance.request(requestConfig);
    });
};
exports.axiosAuthRefresh = axiosAuthRefresh;
