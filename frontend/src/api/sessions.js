// frontend/src/api/sessions.js

import api from './api';

// Buscar sessões abertas da unit ativa
export const fetchOpenSessions = async () => {
  const response = await api.get('/sessions/open');
  return response.data;
};

export const fetchSessionHistory = async () => {
  const response = await api.get('/sessions/history');
  return response.data;
};

export const createSession = async (data) => {
  const response = await api.post('/sessions', data);
  return response.data;
};

export const getSessionById = async (id) => {
  const response = await api.get(`/sessions/${id}`);
  return response.data;
};

export const updateSession = async (id, data) => {
  const response = await api.put(`/sessions/${id}`, data);
  return response.data;
};

export const closeSession = async (id, data) => {
  const response = await api.put(`/sessions/${id}/close`, data);
  return response.data;
};

export const cancelSession = async (id) => {
  const response = await api.put(`/sessions/${id}/cancel`);
  return response.data;
};

