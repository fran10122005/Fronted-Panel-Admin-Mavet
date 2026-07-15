import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !window.location.pathname.startsWith("/sign")) {
      localStorage.removeItem("user");
      window.location.href = "/signin";
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
