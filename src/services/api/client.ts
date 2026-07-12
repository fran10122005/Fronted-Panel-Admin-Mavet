import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

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
