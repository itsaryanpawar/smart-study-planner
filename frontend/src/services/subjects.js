import api from "./api";

export async function fetchSubjects(params = {}) {
  const response = await api.get("/api/subjects", { params });
  return response.data;
}

export async function fetchSubject(subjectId) {
  const response = await api.get(`/api/subjects/${subjectId}`);
  return response.data;
}

export async function createSubject(payload) {
  const response = await api.post("/api/subjects", payload);
  return response.data;
}

export async function updateSubject(subjectId, payload) {
  const response = await api.put(`/api/subjects/${subjectId}`, payload);
  return response.data;
}

export async function deleteSubject(subjectId) {
  await api.delete(`/api/subjects/${subjectId}`);
}
