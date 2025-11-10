import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">DandelionDB</h1>
          <p className="hero-subtitle">
            Your intelligent product price comparison platform
          </p>
          <p className="hero-description">
            Track prices, compare products, and make informed purchasing decisions
          </p>
          <Link to="/search" className="cta-button">
            Start Searching
          </Link>
        </div>
      </header>

      <section className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🔍 Smart Search</h3>
            <p>Search across multiple retailers to find the best prices</p>
          </div>
          <div className="feature-card">
            <h3>📊 Price Tracking</h3>
            <p>Monitor price changes and get notified of deals</p>
          </div>
          <div className="feature-card">
            <h3>🛒 Product Comparison</h3>
            <p>Compare products side-by-side to make better decisions</p>
          </div>
          <div className="feature-card">
            <h3>🌐 Multi-Store Support</h3>
            <p>Aggregate data from various online retailers</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
