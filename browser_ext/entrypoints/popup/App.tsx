import { useState, useEffect, FormEvent } from 'react';
import './App.css';

type View = 'login' | 'home';

interface Product {
  id?: number;
  name: string;
  upc: string;
  sku: string;
  description: string;
  brand: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

function App() {
  const [view, setView] = useState<View>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isSupportedPlatform, setIsSupportedPlatform] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detectedFields, setDetectedFields] = useState<string[]>([]);

  // login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // check current tab URL on mount and when popup opens
  useEffect(() => {
    if (typeof browser !== 'undefined') {
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs[0]?.url) {
          const url = tabs[0].url.toLowerCase();
          setCurrentUrl(tabs[0].url);
          // check if on lightspeed or bigcommerce
          const isSupported = url.includes('lightspeed') || url.includes('bigcommerce');
          setIsSupportedPlatform(isSupported);
          
          // Detect fields on the page by sending message to background
          if (isSupported) {
            browser.runtime.sendMessage({ type: 'DETECT_FIELDS' })
              .then((response: any) => {
                if (response?.success) {
                  setDetectedFields(response.fields);
                }
              })
              .catch(err => console.error('Error detecting fields:', err));
          }
        }
      });
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // TODO: implement auth with backend
    console.log('Login:', { username, password });
    setIsAuthenticated(true);
    setView('home');
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedProduct(null);
    
    // TODO: replace with actual API call to backend
    // simulate API call with multiple sample results
    setTimeout(() => {
      setSearchResults([
        {
          id: 1,
          name: 'LEGO Star Wars Millennium Falcon',
          upc: '673419353908',
          sku: 'LEGO-75257',
          description: 'Iconic Star Wars ship building set with 1,351 pieces. Features opening cockpit, rotating gun turrets, and detailed interior.',
          brand: 'LEGO',
          price: 159.99,
          quantity: 5,
          imageUrl: 'https://via.placeholder.com/150?text=LEGO+Falcon'
        },
        {
          id: 2,
          name: 'LEGO Star Wars X-Wing Fighter',
          upc: '673419318150',
          sku: 'LEGO-75301',
          description: 'Build and display the iconic X-Wing Starfighter from Star Wars. 474 pieces.',
          brand: 'LEGO',
          price: 49.99,
          quantity: 12,
          imageUrl: 'https://via.placeholder.com/150?text=LEGO+X-Wing'
        },
        {
          id: 3,
          name: 'LEGO Star Wars TIE Fighter',
          upc: '673419340267',
          sku: 'LEGO-75300',
          description: 'Recreate epic Star Wars battles with this TIE Fighter building set. 432 pieces.',
          brand: 'LEGO',
          price: 39.99,
          quantity: 8,
          imageUrl: 'https://via.placeholder.com/150?text=LEGO+TIE'
        }
      ]);
      setIsSearching(false);
    }, 800);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToResults = () => {
    setSelectedProduct(null);
  };

  const handleAutofill = async () => {
    if (!selectedProduct) return;

    try {
      // send message to background script which will forward to all frames
      const response = await browser.runtime.sendMessage({
        type: 'FILL_FORM',
        product: selectedProduct
      });
      
      if (response?.success && response.fieldsFilled > 0) {
        alert(`✓ Successfully auto-filled ${response.fieldsFilled} fields!`);
      } else {
        // don't show alert - user can see the issue from lack of visual feedback
        console.warn('[DandelionDB] No fields filled. Make sure you\'re on a product form page.');
      }
    } catch (err) {
      console.error('Error autofilling:', err);
      // only alert on actual errors, not missing fields?? This is not working
    }
  };

  // login View
  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="header">
          <h1>DandelionDB</h1>
        </div>
        <div className="content">
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // home View
  if (view === 'home') {
    return (
      <div className="container">
        <div className="header">
          <h1>DandelionDB</h1>
          <button className="logout-btn" onClick={() => setIsAuthenticated(false)}>
            Logout
          </button>
        </div>
        <div className="content">
          {isSupportedPlatform ? (
            <div className="autofill-section">
              <div className="status-banner success">
                <span className="status-icon">✓</span>
                <span>Ready to autofill</span>
              </div>
              
              {detectedFields.length > 0 && (
                <div className="detected-fields">
                  <p className="detected-text">Detected {detectedFields.length} product fields on this page</p>
                </div>
              )}

              <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                  <label htmlFor="search">Search Product</label>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter product name, UPC, or SKU..."
                    disabled={isSearching}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </form>

              {/* Search Results Grid */}
              {searchResults.length > 0 && !selectedProduct && (
                <div className="search-results">
                  <h3 className="results-header">{searchResults.length} Results Found</h3>
                  <div className="results-grid">
                    {searchResults.map((product) => (
                      <div 
                        key={product.id} 
                        className="product-tile"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="product-image">
                          <img src={product.imageUrl} alt={product.name} />
                        </div>
                        <div className="product-info">
                          <h4 className="product-name">{product.name}</h4>
                          <p className="product-brand">{product.brand}</p>
                          <p className="product-price">${product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Product Detail */}
              {selectedProduct && (
                <div className="product-detail">
                  <button onClick={handleBackToResults} className="btn-back">
                    ← Back to Results
                  </button>
                  <div className="product-card">
                    {selectedProduct.imageUrl && (
                      <div className="product-image-large">
                        <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                      </div>
                    )}
                    <h3>{selectedProduct.name}</h3>
                    <div className="product-details">
                      <div className="detail-row">
                        <span className="label">Brand:</span>
                        <span className="value">{selectedProduct.brand}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">UPC:</span>
                        <span className="value">{selectedProduct.upc}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">SKU:</span>
                        <span className="value">{selectedProduct.sku}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Price:</span>
                        <span className="value">${selectedProduct.price}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Quantity:</span>
                        <span className="value">{selectedProduct.quantity}</span>
                      </div>
                      <div className="description">
                        <span className="label">Description:</span>
                        <p className="value">{selectedProduct.description}</p>
                      </div>
                    </div>
                    <button onClick={handleAutofill} className="btn btn-success btn-large">
                      Autofill Form
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="autofill-unavailable">
              <div className="status-icon warning">⚠</div>
              <h2>Autofill Not Available</h2>
              <p>DandelionDB autofill works on supported platforms only.</p>
              <div className="info-card">
                <h3>Supported Platforms:</h3>
                <ul>
                  <li>Lightspeed Retail</li>
                  <li>BigCommerce</li>
                </ul>
                <p className="help-text">
                  Navigate to a product form on one of these platforms to use autofill.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // return null as fallback
  return null;
}

export default App;
