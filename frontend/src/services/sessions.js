import api from "./api";

export async function fetchSessions(params = {}) {
  const response = await api.get("/api/sessions", { params });
  return response.data;
}

export async function fetchSession(sessionId) {
  const response = await api.get(`/api/sessions/${sessionId}`);
  return response.data;
}

export async function createSession(payload) {
  const response = await api.post("/api/sessions", payload);
  return response.data;
}

export async function updateSession(sessionId, payload) {
  const response = await api.put(`/api/sessions/${sessionId}`, payload);
  return response.data;
}

export async function deleteSession(sessionId) {
  await api.delete(`/api/sessions/${sessionId}`);
}
