export const apiClient = {
    fetch: (endpoint: String, options: any = {}) => {
      const baseUrl = "http://localhost:8080";//import.meta.env.WXT_BACKEND_URL;
      
      return fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    }
};