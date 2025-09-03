import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001', // Use the environment variable
});

export default api;
