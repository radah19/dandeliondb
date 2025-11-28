import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from 'typescript-cookie';
import './SearchHomePage.css';
import { apiClient } from '../services/api';

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

function SearchHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recentSearches, setRecentSearches] = useState<Product[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();

  const RESULTS_PER_PAGE = 6;
  const CAROUSEL_ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(searchResults.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const currentResults = searchResults.slice(startIndex, endIndex);

  const carouselStartIndex = carouselIndex * CAROUSEL_ITEMS_PER_PAGE;
  const carouselEndIndex = carouselStartIndex + CAROUSEL_ITEMS_PER_PAGE;
  const currentCarouselItems = recentSearches.slice(carouselStartIndex, carouselEndIndex);
  const totalCarouselPages = Math.ceil(recentSearches.length / CAROUSEL_ITEMS_PER_PAGE);

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      // Get user email from session cookie
      const sessionUser = getCookie("sessionUser");
      if (!sessionUser) {
        console.log('No user session found');
        setRecentSearches([]);
        return;
      }

      const user = JSON.parse(sessionUser);
      const email = user.email;

      const res = await apiClient.fetch(`/search/${encodeURIComponent(email)}`, {
        method: 'GET'
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecentSearches(data);
        }
      } else {
        console.log('Search history endpoint returned:', res.status);
        // If endpoint doesn't exist yet, just don't show recent searches
        setRecentSearches([]);
      }
    } catch (err) {
      console.error('Error fetching search history:', err);
      setRecentSearches([]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search triggered with query:', searchQuery);
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setCurrentPage(1);
    try {
      console.log('Making API request to:', `/product/${encodeURIComponent(searchQuery)}`);
      const res = await apiClient.fetch(`/product/${encodeURIComponent(searchQuery)}`, { 
        method: 'GET' 
      });

      console.log('API response status:', res.status);
      if (!res.ok) {
        console.error('Search request failed', res.status);
        setSearchResults([]);
      } else {
        const data = await res.json();
        console.log('API response data:', data);
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductClick = (product: Product) => {
    // TODO: Navigate to product detail page or open modal
    console.log('Selected product:', product);
  };

  const handleBackToSearch = () => {
    setHasSearched(false);
    setSearchResults([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="search-home-page">
      <div className="search-home-container">
        {/* only show title and subtitle when no search has been performed */}
        {!hasSearched && (
          <>
            <p className="search-home-subtitle">Search for products in your database</p>
          </>
        )}
        
        <div className="search-wrapper">
          {/* shnow back button when search results are displayed */}
          {hasSearched && (
            <button onClick={handleBackToSearch} className="back-button">
              Back
            </button>
          )}
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, UPC, or SKU..."
                className="search-input"
                disabled={isSearching}
              />
              <button type="submit" className="search-button" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* recent searches */}
        {!hasSearched && recentSearches.length > 0 && (
          <div className="recent-searches-section">
            <h3 className="recent-searches-header">Recent Searches</h3>
            <div className="carousel-container">
              <button 
                className="carousel-btn carousel-btn-prev"
                onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                disabled={carouselIndex === 0}
              >
                ←
              </button>
              <div className="carousel-content">
                {currentCarouselItems.map((product) => (
                  <div 
                    key={product.id} 
                    className="product-tile"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="product-image">
                      {product.imageURLs && product.imageURLs.length > 0 ? (
                        <img src={product.imageURLs[0]} alt={product.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-brand">{product.brand}</p>
                      <p className="product-price">${product.price?.toFixed(2)}</p>
                      {product.descriptions && product.descriptions.length > 0 && (
                        <p className="product-description">
                          {product.descriptions[0].substring(0, 80)}
                          {product.descriptions[0].length > 80 ? '...' : ''}
                        </p>
                      )}
                      {product.tags && product.tags.length > 0 && (
                        <div className="product-tags">
                          {product.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="carousel-btn carousel-btn-next"
                onClick={() => setCarouselIndex(prev => Math.min(totalCarouselPages - 1, prev + 1))}
                disabled={carouselIndex === totalCarouselPages - 1}
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Search results */}
        {hasSearched && !isSearching && (
          <>
            {searchResults.length > 0 ? (
              <div className="results-section">
                <h3 className="results-header">{searchResults.length} Results Found</h3>
                <div className="results-grid">
                  {currentResults.map((product) => (
                    <div 
                      key={product.id} 
                      className="product-tile"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="product-image">
                        {product.imageURLs && product.imageURLs.length > 0 ? (
                          <img src={product.imageURLs[0]} alt={product.name} />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </div>
                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>
                        <p className="product-brand">{product.brand}</p>
                        <p className="product-price">${product.price?.toFixed(2)}</p>
                        {product.descriptions && product.descriptions.length > 0 && (
                          <p className="product-description">
                            {product.descriptions[0].substring(0, 80)}
                            {product.descriptions[0].length > 80 ? '...' : ''}
                          </p>
                        )}
                        {product.tags && product.tags.length > 0 && (
                          <div className="product-tags">
                            {product.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* paging (can't test this cant find any resutls with more than 1 page😭) */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      className="pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-results">
                <p>No products found for "{searchQuery}"</p>
                <p className="hint">Try searching with different keywords</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchHomePage;
