// API base URL - update this based on your Railway deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Product interface matching your Spring Boot backend model
export interface Product {
  name: string;
  brand: string;
  price: number;
  tags?: string[];
  upc?: string;
  sku?: string;
  ean?: string;
  weight?: number;
  descriptions?: string[];
}

// API service functions
export const api = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  // Get product by name and brand
  async getProduct(name: string, brand: string): Promise<Product> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${encodeURIComponent(name)}/${encodeURIComponent(brand)}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  },

  // Search products (you may need to implement this endpoint in your backend)
  async searchProducts(query: string): Promise<Product[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error('Failed to search products');
    }
    return response.json();
  },

  // Trigger scraping (calls your ScrapingController)
  async triggerScraping(url: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      throw new Error('Failed to trigger scraping');
    }
  },
};

export default api;
