import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const authStore = useAuthStore();
  const token = authStore.accessToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    const authStore = useAuthStore();

    if (axios.isAxiosError(error)) {
      const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await authStore.refresh();

          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          return Promise.reject(refreshError instanceof Error ? refreshError : new Error(String(refreshError)));
        }
      }
    }

    const finalError = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(finalError);
  },
);

export default api;
