import api from "./api";

export async function fetchDashboardStats() {
  const response = await api.get("/api/dashboard/stats");
  return response.data;
}
