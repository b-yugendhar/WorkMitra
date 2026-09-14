import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Depending on backend host
});

// Since authentication wasn't fully mocked on the client yet, 
// we intercept and add a dummy auth token or handle dynamically.
api.interceptors.request.use((config) => {
    // Attempt to get token from storage
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
