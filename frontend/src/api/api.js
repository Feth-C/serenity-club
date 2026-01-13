import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// -----------------------------
// Request interceptor
// -----------------------------
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -----------------------------
// Response interceptor
// -----------------------------
api.interceptors.response.use(
  response => response.data, // retorna apenas o data
  async error => {
    const originalRequest = error.config;

    // Se erro 401 e não é retry
    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject({
          status: err.response?.status || 401,
          message: err.response?.data?.error || 'Sessão expirada. Faça login novamente.'
        });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.error || 'Erro inesperado'
    });
  }
);

export default api;
