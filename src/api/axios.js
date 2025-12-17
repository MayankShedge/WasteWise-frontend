import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001', // Use the environment variable
});

export default api;
/*
What is Axios?

Axios is a promise-based HTTP client used to make requests (like GET, POST, PUT, DELETE) from your app to a server or API.

You can think of it as an easier and cleaner version of fetch() with better error handling and simpler syntax.

🧠 What is Axios?

Axios is a promise-based HTTP client used to make requests (like GET, POST, PUT, DELETE) from your app to a server or API.

You can think of it as an easier and cleaner version of fetch() with better error handling and simpler syntax.

🧩 Line-by-line breakdown of your code
import axios from 'axios';


This imports the axios library so you can use it in your file.

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});

Here’s what’s happening:

axios.create()

It creates a custom Axios instance with default settings.

This is helpful so you don’t have to repeat the same baseURL, headers, etc., every time you make a request.

baseURL

This is the default root URL for all your requests.

So if baseURL is 'http://localhost:5001' and you later call api.get('/users'),
→ Axios will actually call http://localhost:5001/users

import.meta.env.VITE_API_URL

This accesses an environment variable in a Vite project.

Environment variables are defined in your .env file (for example: VITE_API_URL=https://yourapi.com).

This lets you switch between environments — local, staging, or production — without changing code.

|| 'http://localhost:5001'

This means: if VITE_API_URL is not defined, fall back to http://localhost:5001 (your local backend).
*/
