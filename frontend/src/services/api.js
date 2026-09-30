import axios from 'axios';
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
export const AI_URL = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000';
export const api = axios.create({baseURL:API_URL,timeout:5000});
export const aiApi = axios.create({baseURL:AI_URL,timeout:8000});
export const endpoints = {
 dashboard:()=>api.get('/dashboard'), phcs:()=>api.get('/phcs'), inventory:id=>api.get(`/inventory/${id}`),
 beds:id=>api.get(`/beds/${id}`), staff:id=>api.get(`/staff/${id}`),
 predict:body=>aiApi.post('/predict',body), recommend:body=>aiApi.post('/redistribute/recommend',body),
 assistant:body=>aiApi.post('/assistant/query',body), emergency:()=>aiApi.post('/emergency/dengue-surge'),
 federated:round=>aiApi.post('/federated/train-round',{roundNumber:round}), transferStatus:(id,status)=>api.put(`/transfers/${id}/status`,{status})
};
