import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://askmydocs-38au.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const uploadDocument = async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
    return response.data;
};

export const getDocuments = async () => {
    const response = await api.get(`/documents`);
    return response.data;
};

export const deleteDocument = async (docId) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
};

export const queryDocument = async (docIds, question) => {
    const res = await api.post(`/query`, { doc_ids: docIds, question });
    return res.data;
};

export const getChatHistory = async (docIds) => {
    const res = await api.get(`/chat-history/${docIds}`);
    return res.data;
};
