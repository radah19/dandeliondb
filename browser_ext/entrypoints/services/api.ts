export const apiClient = {
    fetch: (endpoint: String, options: any = {}) => {
      const baseUrl = import.meta.env.WXT_BACKEND_URL || 'https://dandeliondbapi.up.railway.app';
      
      return fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    }
};