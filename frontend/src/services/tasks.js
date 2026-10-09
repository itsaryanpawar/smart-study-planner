import api from "./api";

export async function fetchTasks(params = {}) {
  const response = await api.get("/api/tasks", { params });
  return response.data;
}

export async function fetchTask(taskId) {
  const response = await api.get(`/api/tasks/${taskId}`);
  return response.data;
}

export async function createTask(payload) {
  const response = await api.post("/api/tasks", payload);
  return response.data;
}

export async function updateTask(taskId, payload) {
  const response = await api.put(`/api/tasks/${taskId}`, payload);
  return response.data;
}

export async function updateTaskStatus(taskId, status) {
  const response = await api.patch(`/api/tasks/${taskId}/status`, { status });
  return response.data;
}

export async function deleteTask(taskId) {
  await api.delete(`/api/tasks/${taskId}`);
}
