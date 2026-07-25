import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const uploadDocument = async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
    return response.data;
};

export const getDocuments = async () => {
    const response = await axios.get(`${API_URL}/documents`);
    return response.data;
};

export const deleteDocument = async (docId) => {
    const response = await axios.delete(`${API_URL}/documents/${docId}`);
    return response.data;
};

export const queryDocument = async (docId, question) => {
    const response = await axios.post(`${API_URL}/query`, { doc_id: docId, question });
    return response.data;
};

export const getChatHistory = async (docId) => {
    const response = await axios.get(`${API_URL}/chat-history/${docId}`);
    return response.data;
};
