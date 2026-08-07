import axios from 'axios';

const API_URL = 'https://askmydocs-38au.onrender.com/api';

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

export const queryDocument = async (docIds, question) => {
    const res = await axios.post(`${API_URL}/query`, { doc_ids: docIds, question });
    return res.data;
};

export const getChatHistory = async (docIds) => {
    const res = await axios.get(`${API_URL}/chat-history/${docIds}`);
    return res.data;
};
