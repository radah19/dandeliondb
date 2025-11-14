import { useState, useEffect, FormEvent } from 'react';
import './App.css';

type View = 'login' | 'home';

function App() {
  const [view, setView] = useState<View>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isSupportedPlatform, setIsSupportedPlatform] = useState(false);

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
        }
      });
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // TODO: implement auth
    console.log('Login:', { username, password });
    setIsAuthenticated(true);
    setView('home');
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
            <div className="autofill-ready">
              <div className="status-icon">✓</div>
              <h2>Autofill Ready</h2>
              <p>DandelionDB is ready to autofill product forms on this page.</p>
              <div className="info-card">
                <h3>How to use:</h3>
                <ul>
                  <li>Click on any product form field</li>
                  <li>Select from autofill suggestions</li>
                  <li>Save time on data entry!</li>
                </ul>
              </div>
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
