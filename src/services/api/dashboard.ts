import { axiosInstance } from "./client";

export const dashboard = {
  getDashboardStats: async (): Promise<any> => {
    try {
      const res = await axiosInstance.get("/api/reportes/dashboard");
      return res.data.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
};
