import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
export const AI_URL = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000';

export const api = axios.create({ baseURL: API_URL, timeout: 8000 });
export const aiApi = axios.create({ baseURL: AI_URL, timeout: 12000 });

export const endpoints = {
  // Dashboard & Metrics
  dashboard: () => api.get('/dashboard'),

  // PHC Centers CRUD
  phcs: () => api.get('/phcs'),
  phcById: (id) => api.get(`/phcs/${id}`),
  createPhc: (data) => api.post('/phcs', data),
  updatePhc: (id, data) => api.put(`/phcs/${id}`, data),
  deletePhc: (id) => api.delete(`/phcs/${id}`),

  // Inventory CRUD
  inventory: (phcId) => api.get(`/inventory/${phcId}`),
  addInventory: (data) => api.post('/inventory', data),
  updateInventory: (id, data) => api.put(`/inventory/${id}`, data),
  deleteInventory: (id) => api.delete(`/inventory/${id}`),

  // Beds & Staffing
  beds: (phcId) => api.get(`/beds/${phcId}`),
  updateBeds: (phcId, data) => api.put(`/beds/${phcId}`, data),
  staff: (phcId) => api.get(`/staff/${phcId}`),
  updateStaff: (phcId, data) => api.put(`/staff/${phcId}`, data),

  // Alerts
  alerts: (status = 'ACTIVE') => api.get(`/alerts?status=${status}`),
  createAlert: (data) => api.post('/alerts', data),
  resolveAlert: (id) => api.put(`/alerts/${id}/resolve`, {}),

  // Transfers Lifecycle
  transfers: (phcId) => api.get(phcId ? `/transfers?phcId=${phcId}` : '/transfers'),
  createTransfer: (data) => api.post('/transfers', data),
  transferStatus: (id, status) => api.put(`/transfers/${id}/status`, { status }),

  // Python AI Engine Endpoints
  predict: (body) => aiApi.post('/predict', body),
  recommend: (body) => aiApi.post('/redistribute/recommend', body),
  assistant: (body) => aiApi.post('/assistant/query', body),
  emergency: () => aiApi.post('/emergency/dengue-surge'),
  federated: (round = 1) => aiApi.post('/federated/train-round', { roundNumber: round }),
  phcRisk: (phcId) => aiApi.get(`/risk/assess/${phcId}`),
  districtRisk: (district) => aiApi.get(`/risk/district/${district}`)
};
