import { useState, useEffect, FormEvent } from 'react';
import './App.css';
import { apiClient } from '../services/api';
import { StatusCodes } from 'http-status-codes';
import validator from 'validator';
import prevIcon from '../../assets/prev-image.svg';
import nextIcon from '../../assets/next-image.svg';
import downloadIcon from '../../assets/download-image.svg';
import settingsIcon from '../../assets/autofill-settings.svg';

type View = 'login' | 'home';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [autofillFields, setAutofillFields] = useState({
    name: true,
    upc: true,
    sku: true,
    brand: true,
    price: true,
    quantity: true,
    description: true,
    images: true
  });

  // login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // check current tab URL on mount and when popup opens
  useEffect(() => {
    // Perform Sign in if session exists
    storage.getItem<SessionUserType>('local:sessionUser').then((result) => {
      if (result && result.email && result.sessionId) {
        apiClient.fetch("/session-login", {
            method: "POST",
            body: JSON.stringify({
                email: result.email,
                sessionId: result.sessionId
            })
        }).then(result => {
            if(result.status != StatusCodes.OK) {
                // Login Failed
                console.log("SADNESS!!");
            } else {
                // Login Successful!
                console.log("Yipee!");
                setEmail(email);
                        
                setIsAuthenticated(true);
                setView('home');
                setLoginError('');
            }
      });
    }
    });

    if (typeof browser !== 'undefined') {
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs[0]?.url) {
          const url = tabs[0].url.toLowerCase();
          setCurrentUrl(tabs[0].url);
          // check if on lightspeed or bigcommerce. first one may not be needed
          const isSupported = url.includes('lightspeed') || url.includes('bigcommerce') || url.includes('merchantos');
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
    setLoginError(''); // Clear any previous errors
    
    console.log('Login:', { email, password });

    if (!validator.isEmail(email)) {
      setLoginError("Please enter a valid email address");
      return;
    }

    apiClient.fetch("/login", {
      method: "POST",
      body: JSON.stringify({
          email: email,
          password: password
      })
    }).then(result => {
      console.log("Result ", result);

      if(result.status != StatusCodes.ACCEPTED) {
        // Login Failed
        setLoginError("Incorrect username or password");
      } else {
        // Login Successful!
        result.text().then(async (body) => {
          await storage.setItem('local:sessionUser', {
            email: email,
            sessionId: body.split("\n")[1]
          });

          setEmail(email);
          setPassword("");
        });

        setIsAuthenticated(true);
        setView('home');
        setLoginError('');
      }
    }).catch(err => {
      console.error("Login error:", err);
      setLoginError("Unable to connect. Please try again.");
    });

  };

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    // TODO: implement auth with backend
    console.log('Signup:', { email, password });

    if (!validator.isEmail(email)) {
      console.log("Email not provided!");
      return;
    }

    apiClient.fetch("/signup", {
      method: "POST",
      body: JSON.stringify({
          email: email,
          password: password
      })
    }).then(result => {
      console.log("Result ", result);

      if(result.status != StatusCodes.CREATED) {
        // Login Failed
        console.log("SADNESS!!");
      } else {
        // Login Successful!
        console.log("Yipee!");

        result.text().then(async (body) => {
          await storage.setItem('local:sessionUser', {
            email: email,
            sessionId: body.split("\n")[1]
          });

          setEmail(email);
          setPassword("");
        });

        setIsAuthenticated(true);
        setView('home');
      }
    });

  };

  const handleLogout = (e: FormEvent) => {
    e.preventDefault();

    apiClient.fetch("/logout", {
      method: "POST",
      body: JSON.stringify({
          email: email,
      })
    }).then(result => {
      if(result.status != StatusCodes.OK) {
        // Logout Failed
        console.log("SADNESS!!");
      } else {
        // Logout Successful!
        console.log("Yipee!");
        result.text().then(() => {
          setIsAuthenticated(false)
        });
      }
    });
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const queryToSearch = searchQuery.trim();
    setIsSearching(true);
    setSearchResults([]);
    setSelectedProduct(null);
    setHasSearched(false);
    setLastSearchQuery(queryToSearch);
    try {
      const res = await apiClient.fetch(`/product/${encodeURIComponent(queryToSearch)}`, { method: 'GET' });

      if (!res.ok) {
        console.error('[DandelionDB] Search request failed', res.status);
        setSearchResults([]);
      } else {
        const data = await res.json();
        console.log(data);
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error('[DandelionDB] Error searching products:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0); // Reset to first image when selecting a product
  };

  const handleBackToResults = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedProduct?.imageURLs) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.imageURLs.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedProduct?.imageURLs) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProduct.imageURLs.length - 1 : prev - 1
      );
    }
  };

  const handleAutofill = async () => {
    if (!selectedProduct) return;

    // create a filtered product object with only selected fields
    const filteredProduct: any = {};
    
    if (autofillFields.name) filteredProduct.name = selectedProduct.name;
    if (autofillFields.upc) filteredProduct.upc = selectedProduct.upc;
    if (autofillFields.sku) filteredProduct.sku = selectedProduct.sku;
    if (autofillFields.brand) filteredProduct.brand = selectedProduct.brand;
    if (autofillFields.price) filteredProduct.price = selectedProduct.price;
    if (autofillFields.description) filteredProduct.descriptions = selectedProduct.descriptions;
    if (autofillFields.images) filteredProduct.imageURLs = selectedProduct.imageURLs;

    try {
      // send message to background script which will forward to all frames
      const response = await browser.runtime.sendMessage({
        type: 'FILL_FORM',
        product: filteredProduct,
        autofillSettings: autofillFields
      });
      
      if (response?.success && response.fieldsFilled > 0) {
        try {
          await apiClient.fetch(
            `/search/${encodeURIComponent(email)}/${encodeURIComponent(selectedProduct.name)}/${encodeURIComponent(selectedProduct.brand)}`,
            { method: 'POST' }
          );
        } catch (err) {
          console.warn('[DandelionDB] Failed to track search history:', err);
          // Don't fail the autofill if tracking fails
        }
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
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
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
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
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
          <button className="logout-btn" onClick={handleLogout}>
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

              {/* no results */}
              {hasSearched && searchResults.length === 0 && !selectedProduct && !isSearching && (
                <div className="no-results">
                  <p>No products found for "{lastSearchQuery}"</p>
                  <p className="no-results-hint">Try searching with a different name, UPC, or SKU</p>
                </div>
              )}

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
                          <img src={product.imageURLs?.[0] || ''} alt={product.name} />
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

              {/* selected Product detail */}
              {selectedProduct && (
                <div className="product-detail">
                  <button onClick={handleBackToResults} className="btn-back">
                    ← Back to Results
                  </button>
                  <div className="product-card">
                    {selectedProduct.imageURLs && selectedProduct.imageURLs.length > 0 && (
                      <div className="product-image-carousel">
                        <div className="product-image-large">
                          <img src={selectedProduct.imageURLs[currentImageIndex]} alt={selectedProduct.name} />
                        </div>
                        <div className="carousel-controls">
                          <div className="carousel-spacer"></div>
                          {selectedProduct.imageURLs.length > 1 && (
                            <div className="carousel-nav">
                              <button 
                                className="carousel-btn prev" 
                                onClick={handlePrevImage}
                              >
                                <img src={prevIcon} alt="Previous" />
                              </button>
                              <div className="carousel-dots">
                                {selectedProduct.imageURLs.map((_, idx) => (
                                  <span 
                                    key={idx} 
                                    className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(idx)}
                                  />
                                ))}
                              </div>
                              <button 
                                className="carousel-btn next" 
                                onClick={handleNextImage}
                              >
                                <img src={nextIcon} alt="Next" />
                              </button>
                            </div>
                          )}
                          <a 
                            href={selectedProduct.imageURLs[currentImageIndex]} 
                            download
                            className="download-btn"
                            title="Download image"
                          >
                            <img src={downloadIcon} alt="Download" />
                          </a>
                        </div>
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
                      <div className="description">
                        <span className="label">Description:</span>
                        <p className="value">{selectedProduct.descriptions?.[0] || 'No description available'}</p>
                      </div>
                    </div>
                    <div className="product-actions">
                      <div className="autofill-container">
                        <div className="autofill-header">
                          <button onClick={handleAutofill} className="btn btn-success btn-large">
                            Autofill Form
                          </button>
                          <button 
                            onClick={() => setShowSettings(!showSettings)} 
                            className="btn-settings"
                            title="Autofill Settings"
                          >
                            <img src={settingsIcon} alt="Settings" />
                          </button>
                        </div>
                        {showSettings && (
                          <div className="settings-panel">
                            <h4>Select Fields to Autofill</h4>
                            <div className="settings-checkboxes">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={autofillFields.name}
                                  onChange={(e) => setAutofillFields({...autofillFields, name: e.target.checked})}
                                />
                                <span>Product Name</span>
                              </label>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={autofillFields.upc}
                                  onChange={(e) => setAutofillFields({...autofillFields, upc: e.target.checked})}
                                />
                                <span>UPC</span>
                              </label>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={autofillFields.sku}
                                  onChange={(e) => setAutofillFields({...autofillFields, sku: e.target.checked})}
                                />
                                <span>SKU</span>
                              </label>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={autofillFields.brand}
                                  onChange={(e) => setAutofillFields({...autofillFields, brand: e.target.checked})}
                                />
                                <span>Brand</span>
                              </label>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={autofillFields.price}
                                  onChange={(e) => setAutofillFields({...autofillFields, price: e.target.checked})}
                                />
                                <span>Price</span>
                              </label>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={autofillFields.quantity}
                                  onChange={(e) => setAutofillFields({...autofillFields, quantity: e.target.checked})}
                                />
                                <span>Quantity</span>
                              </label>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={autofillFields.description}
                                  onChange={(e) => setAutofillFields({...autofillFields, description: e.target.checked})}
                                />
                                <span>Description</span>
                              </label>
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={autofillFields.images}
                                  onChange={(e) => setAutofillFields({...autofillFields, images: e.target.checked})}
                                />
                                <span>Images</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                      <button className="btn btn-flag">
                        🚩 Flag Content
                      </button>
                    </div>
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

interface SessionUserType {
  email: string;
  sessionId: string;
}