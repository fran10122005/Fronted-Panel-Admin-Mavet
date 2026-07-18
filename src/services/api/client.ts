import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (token: string | null, error: any = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      !window.location.pathname.startsWith("/sign")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${API_BASE}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data?.data?.token;
        if (newToken) {
          localStorage.setItem("token", newToken);
        }

        processQueue(newToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(null, refreshError);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function wakeUpBackend(timeout = 60000): Promise<void> {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    fetch(`${API_BASE}/api/visitantes/motivos`, { signal: controller.signal })
      .then(() => resolve())
      .catch(() => resolve())
      .finally(() => clearTimeout(timer));
  });
}

export function extractPagination(res: any, list: any[]) {
  const meta = res?.data?.meta || { totalItems: list.length, totalPages: 1, currentPage: 1 };
  return {
    data: list,
    totalItems: meta.totalItems,
    totalPages: meta.totalPages,
    currentPage: meta.currentPage,
  };
}

export function extractList(res: any): any[] {
  return Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res?.data?.data)
      ? res.data.data
      : [];
}
