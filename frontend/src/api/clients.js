// frontend/src/api/clients.js

import api from './api';

export const getClients = () => {
  return api.get('/clients');
};

export const getClientById = (id) => {
  return api.get(`/clients/${id}`);
};

export const createClient = (data) => {
  return api.post('/clients', data);
};

export const updateClient = (id, data) => {
  return api.put(`/clients/${id}`, data);
};

export const deleteClient = (id) => {
  return api.delete(`/clients/${id}`);
};
