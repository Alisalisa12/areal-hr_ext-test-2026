import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { Notify } from 'quasar';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: '/api' });
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    let message: string;

    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        message = 'Сессия истекла. Пожалуйста, войдите снова.';
      } else if (status === 403) {
        message = 'У вас нет прав для этого действия (403).';
      } else if (status === 404) {
        message = 'Запрашиваемый ресурс не найден (404).';
      } else {
        message = error.response.data?.message || `Ошибка сервера: ${status}`;
      }
      Notify.create({
        type: 'negative',
        message: message,
        position: 'top-right',
        timeout: 3000,
      });
    } else {
      Notify.create({
        type: 'negative',
        message: 'Ошибка сети: сервер недоступен',
        position: 'top-right',
      });
    }

    return Promise.reject(error);
  },
);

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
