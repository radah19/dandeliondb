export const apiClient = {
    fetch: (endpoint, options = {}) => {
      const baseUrl = import.meta.env.PROD 
        ? import.meta.env.VITE_BACKEND_URL 
        : '/api';
      
      return fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    }
};