import { useState, useEffect, FormEvent } from 'react';
import './App.css';
import { apiClient } from '../services/api';
import { StatusCodes } from 'http-status-codes';
import validator from 'validator';
import prevIcon from '../../assets/prev-image.svg';
import nextIcon from '../../assets/next-image.svg';
import downloadIcon from '../../assets/download-image.svg';
import settingsIcon from '../../assets/autofill-settings.svg';
import dandelionLogo from '../../assets/dandeliondb.svg';

type View = 'welcome' | 'login' | 'signup' | 'home';

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
  const [view, setView] = useState<View>('welcome');
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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [autofillFields, setAutofillFields] = useState({
    name: true,
    upc: true,
    sku: true,
    brand: true,
    price: true,
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
        if(import.meta.env.WXT_FRONTEND_URL == `http://127.0.0.1:5173`){
          // Skip session verification for localhost
          setEmail(result.email);
                  
          setIsAuthenticated(true);
          setView('home');
          setLoginError('');
          return;
        }

        apiClient.fetch("/session-login", {
            method: "POST",
            body: JSON.stringify({
                email: result.email,
                sessionId: result.sessionId
            })
        }).then(sessionResult => {
            if(sessionResult.status != StatusCodes.OK) {
                // Login Failed
                console.log("SADNESS!!");
            } else {
                // Login Successful!
                console.log("Yipee!");
                setEmail(result.email);
                        
                setIsAuthenticated(true);
                setView('home');
                setLoginError('');
            }
        });
      }
    });
  }, []);

  useEffect(() => {
    const checkCurrentTab = () => {
      if (typeof browser === 'undefined') return;

      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs[0]?.url && tabs[0]?.id) {
          const url = tabs[0].url.toLowerCase();
          const tabId = tabs[0].id;
          setCurrentUrl(tabs[0].url);
          
          const isSupported = url.includes('lightspeed') || url.includes('bigcommerce') || url.includes('merchantos');
          setIsSupportedPlatform(isSupported);
          
          if (isSupported) {
            // Add delay to ensure content script is fully loaded
            setTimeout(() => {
              console.log('[DandelionDB Popup] Sending DETECT_FIELDS message to tab:', tabId);
              browser.runtime.sendMessage({ type: 'DETECT_FIELDS', tabId: tabId })
                .then((response: any) => {
                  console.log('[DandelionDB Popup] DETECT_FIELDS response:', response);
                  if (response?.success) {
                    setDetectedFields(response.fields);
                  } else {
                    console.warn('[DandelionDB Popup] No fields detected:', response?.error);
                    setDetectedFields([]);
                  }
                })
                .catch(err => {
                  console.error('[DandelionDB Popup] Error detecting fields:', err);
                  setDetectedFields([]);
                });
            }, 1000); // Increased delay to 1 second
          } else {
            setDetectedFields([]);
          }
        }
      });
    };

    checkCurrentTab();
    
    window.addEventListener('focus', checkCurrentTab);
    
    return () => {
      window.removeEventListener('focus', checkCurrentTab);
    };
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
    setLoginError('');
    
    if (!validator.isEmail(email)) {
      setLoginError("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 6) {
      setLoginError("Password must be at least 6 characters");
      return;
    }

    apiClient.fetch("/signup", {
      method: "POST",
      body: JSON.stringify({
          email: email,
          password: password
      })
    }).then(result => {
      if(result.status != StatusCodes.CREATED) {
        // Signup Failed
        if (result.status === StatusCodes.CONFLICT) {
          setLoginError("An account with this email already exists");
        } else {
          setLoginError("Sign up failed. Please try again.");
        }
      } else {
        // Signup Successful!
        result.text().then(async (body) => {
          await storage.setItem('local:sessionUser', {
            email: email,
            sessionId: body.split("\n")[1]
          });

          setEmail(email);
          setPassword("");
          setIsAuthenticated(true);
          setView('home');
          setLoginError('');
        }).catch(err => {
          console.error("Error parsing response:", err);
          setLoginError("Sign up failed. Please try again.");
        });
      }
    }).catch(err => {
      console.error("Signup error:", err);
      setLoginError("Unable to connect to server. Please try again.");
    });
  };

  const handleLogout = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const result = await apiClient.fetch("/logout", {
        method: "POST",
        body: JSON.stringify({
            email: email,
        })
      });
      
      if(result.status != StatusCodes.OK) {
        // Logout Failed
        console.log("SADNESS!!");
      } else {
        // Logout Successful!
        console.log("Yipee!");
        await storage.removeItem('local:sessionUser');
        setIsAuthenticated(false);
        setView('welcome');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  const handleGoToHome = () => {
    const frontendUrl = import.meta.env.WXT_FRONTEND_URL || 'https://dandeliondb.up.railway.app';
    browser.tabs.create({ url: frontendUrl });
  };

  const handleGoToDatabase = () => {
    const frontendUrl = import.meta.env.WXT_FRONTEND_URL || 'https://dandeliondb.up.railway.app';
    browser.tabs.create({ url: `${frontendUrl}/search-home` });
  };

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

  const handleGenerateDescription = async () => {
    if (!selectedProduct) return;
    
    setIsGeneratingDescription(true);
    try {
      const response = await apiClient.fetch('/description', {
        method: 'POST',
        body: JSON.stringify(selectedProduct)
      });

      if (!response.ok) {
        console.error('[DandelionDB] Failed to generate description:', response.status);
        alert('Failed to generate description. Please try again.');
        return;
      }

      const generatedDescription = await response.text();
      
      // Update the selected product with the new description
      setSelectedProduct({
        ...selectedProduct,
        descriptions: [generatedDescription]
      } as Product);
    } catch (error) {
      console.error('[DandelionDB] Error generating description:', error);
      alert('Error generating description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
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
      // Get current tab ID
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      
      if (!tabId) {
        alert('Could not find active tab');
        return;
      }
      
      // send message to background script which will forward to all frames
      const response = await browser.runtime.sendMessage({
        type: 'FILL_FORM',
        tabId: tabId,
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
          console.warn('Failed to track search history:', err);
        }
      } else {
        console.warn('[DandelionDB] No fields filled. Make sure you\'re on a product form page.');
      }
    } catch (err) {
      console.error('Error autofilling:', err);
    }
  };

  // Welcome View
  if (view === 'welcome' && !isAuthenticated) {
    return (
      <div className="container">
        <div className="header">
          <h1>DandelionDB</h1>
        </div>
        <div className="content">
          <div className="welcome-page-content">
            <div className="welcome-content">
              <img src={dandelionLogo} alt="DandelionDB" className="welcome-logo" />
              <h2 className="welcome-title">DandelionDB</h2>
              <p className="welcome-tagline">Simplify your toy store's workflow</p>
            </div>
            <div className="welcome-buttons">
              <button onClick={() => { setEmail(''); setPassword(''); setLoginError(''); setView('login'); }} className="btn btn-primary">
                Login
              </button>
              <button onClick={() => { setEmail(''); setPassword(''); setLoginError(''); setView('signup'); }} className="btn btn-primary">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login View
  if (view === 'login' && !isAuthenticated) {
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
          <button onClick={() => { setEmail(''); setPassword(''); setLoginError(''); setView('welcome'); }} className="auth-back-btn">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Signup View
  if (view === 'signup' && !isAuthenticated) {
    return (
      <div className="container">
        <div className="header">
          <h1>DandelionDB</h1>
        </div>
        <div className="content">
          <form onSubmit={handleSignup} className="login-form">
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
              Sign Up
            </button>
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
          </form>
          <button onClick={() => { setEmail(''); setPassword(''); setLoginError(''); setView('welcome'); }} className="auth-back-btn">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // home View
  if (view === 'home') {
    return (
      <div className="container">
        <div className="header">
          <h1 className="clickable-title" onClick={handleGoToHome}>DandelionDB</h1>
          <div className="header-buttons">
            {/* <button className="database-btn" onClick={handleGoToDatabase}>
              Database
            </button> */}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
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
                    placeholder="Enter product name..."
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
                  <p className="no-results-hint">Try searching with a different product name</p>
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
                        <div className="description-header">
                          <span className="label">Description:</span>
                          <button 
                            onClick={handleGenerateDescription} 
                            className="btn-modify-description"
                            disabled={isGeneratingDescription}
                            title="Generate a new AI description"
                          >
                            {isGeneratingDescription ? 'Generating...' : 'Modify Description'}
                          </button>
                        </div>
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