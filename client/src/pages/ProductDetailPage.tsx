import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './ProductDetailPage.css';
import { apiClient } from '../services/api';
import prevIcon from '../assets/prev-image.svg';
import nextIcon from '../assets/next-image.svg';

interface Product {
  id?: number;
  name: string;
  upc: string;
  sku: string;
  descriptions: string[];
  brand: string;
  price: number;
  imageURLs: string[];
  ean?: string | null;
  tags?: string[];
  weights?: any;
}

interface LocationState {
  fromSearch?: boolean;
  searchQuery?: string;
  searchResults?: Product[];
  currentPage?: number;
}

function ProductDetailPage() {
  const { name, brand } = useParams<{ name: string; brand: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (name && brand) {
      fetchProductDetails(name, brand);
    }
  }, [name, brand]);

  const fetchProductDetails = async (productName: string, productBrand: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.fetch(`/product/${encodeURIComponent(productName)}/${encodeURIComponent(productBrand)}`, {
        method: 'GET'
      });

      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        setError(null);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    // If we came from search, navigate back to search-home with the search state
    if (state?.fromSearch) {
      navigate('/search-home', {
        state: {
          restoreSearch: true,
          searchQuery: state.searchQuery,
          searchResults: state.searchResults,
          currentPage: state.currentPage
        }
      });
    } else {
      // Otherwise just go back in history
      navigate(-1);
    }
  };

  const handlePrevImage = () => {
    if (product && product.imageURLs.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.imageURLs.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product && product.imageURLs.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.imageURLs.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Product not found'}</p>
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Search
        </button>

        <div className="product-detail-content">
          {/* Image Gallery Section */}
          <div className="image-gallery-section">
            {product.imageURLs && product.imageURLs.length > 0 ? (
              <div className="image-gallery">
                <div className="main-image-container">
                  <img 
                    src={product.imageURLs[currentImageIndex]} 
                    alt={product.name}
                    className="main-image"
                  />
                  {product.imageURLs.length > 1 && (
                    <>
                      <button 
                        className="image-nav-btn prev-btn" 
                        onClick={handlePrevImage}
                        aria-label="Previous image"
                      >
                        <img src={prevIcon} alt="Previous" />
                      </button>
                      <button 
                        className="image-nav-btn next-btn" 
                        onClick={handleNextImage}
                        aria-label="Next image"
                      >
                        <img src={nextIcon} alt="Next" />
                      </button>
                      <div className="image-counter">
                        {currentImageIndex + 1} / {product.imageURLs.length}
                      </div>
                    </>
                  )}
                </div>
                {product.imageURLs.length > 1 && (
                  <div className="thumbnail-strip">
                    {product.imageURLs.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-image">No images available</div>
            )}
          </div>

          {/* Product Information Section */}
          <div className="product-info-section">
            <h1 className="product-name">{product.name}</h1>
            <p className="product-brand">by {product.brand}</p>
            
            <div className="price-section">
              <span className="price-label">Price:</span>
              <span className="product-price">${product.price.toFixed(2)}</span>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">UPC:</span>
                <span className="info-value">{product.upc || 'N/A'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">SKU:</span>
                <span className="info-value">{product.sku || 'N/A'}</span>
              </div>
              
              {product.ean && (
                <div className="info-item">
                  <span className="info-label">EAN:</span>
                  <span className="info-value">{product.ean}</span>
                </div>
              )}

              {product.id && (
                <div className="info-item">
                  <span className="info-label">Product ID:</span>
                  <span className="info-value">{product.id}</span>
                </div>
              )}
            </div>

            {product.descriptions && product.descriptions.length > 0 && (
              <div className="descriptions-section">
                <h2>Descriptions</h2>
                {product.descriptions.map((desc, index) => (
                  <p key={index} className="description-text">{desc}</p>
                ))}
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="tags-section">
                <h2>Tags</h2>
                <div className="tags-container">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {product.weights && Object.keys(product.weights).length > 0 && (
              <div className="weights-section">
                <h2>Weight Information</h2>
                <div className="weights-grid">
                  {Object.entries(product.weights).map(([key, value]) => (
                    <div key={key} className="weight-item">
                      <span className="weight-label">{key}:</span>
                      <span className="weight-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
