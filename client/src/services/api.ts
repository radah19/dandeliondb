export const apiClient = {
    fetch: (endpoint: String, options: any = {}) => {
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