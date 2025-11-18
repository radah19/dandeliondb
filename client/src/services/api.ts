export const apiClient = {
    fetch: (endpoint: String, options: any = {}) => {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      
      return fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    }
};