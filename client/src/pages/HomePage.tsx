import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomePage.css';
import prevIcon from '../assets/prev-image.svg';
import nextIcon from '../assets/next-image.svg';

interface HomePageProps {
  user: {
    email: string;
  };
}

function HomePage({ user }: HomePageProps) {
  const featuresRef = useRef<HTMLDivElement>(null);
  const [activeTile, setActiveTile] = useState<number>(1);
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = user.email !== '';

  useEffect(() => {
    // check if user is navigating from signup/login page
    const fromAuthPage = location.state?.from === 'auth';
    setShouldAnimate(!fromAuthPage);
    
    // clear state after checking so refresh works
    if (fromAuthPage) {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSignUp = () => {
    navigate('/beta-signup');
  };

  const handleDatabaseClick = () => {
    navigate('/search-home');
  };

  const handlePrevTile = () => {
    setActiveTile(prev => prev === 1 ? 3 : prev - 1);
  };

  const handleNextTile = () => {
    setActiveTile(prev => prev === 3 ? 1 : prev + 1);
  };

  return (
    <div className={`home-page ${shouldAnimate ? '' : 'no-animate'}`}> 
      <div className="hero-container">
        
        <div className="hero-top-section">
          <div className="hero-section">
            <div className="hero-content">
              <img src='/dandeliondb.svg' />
              <h1 className="hero-title">Simplify your toy store's workflow</h1>
              <p className="hero-description">
                The complete toy product database built for independent stores.
              </p>
            </div>
          </div>
          
          <div className="explore-section">
            <button 
              className="signup-cta-button" 
              onClick={isLoggedIn ? handleDatabaseClick : handleSignUp}
            >
              {isLoggedIn ? 'Database' : 'Sign up for beta'}
            </button>
          </div>
        </div>

        <div className="features-section" ref={featuresRef}>
          <div className="carousel-wrapper">
            <button className="carousel-nav-btn prev-btn" onClick={handlePrevTile}>
              <img src={prevIcon} alt="Previous" />
            </button>
            
            <div className="tiles-container">
              <div 
                className="feature-tile"
                style={{ display: activeTile === 1 ? 'block' : 'none' }}
              >
                <h2>Built for Independent Toy Stores</h2>
                <p>
                  We know the struggle of dealing with incomplete product information from vendors.
                  DandelionDB is specifically designed to handle messy, real-world data—helping you build and maintain
                  your product catalog even when details are missing.
                </p>
              </div>

              <div 
                className="feature-tile"
                style={{ display: activeTile === 2 ? 'block' : 'none' }}
              >
                <h2>Smart Autofill</h2>
                <p>
                  Eliminate hours of manual data entry with our smart autofill. Instantly populate product data,
                  descriptions, identifiers, images and more onto your IMS and storepage all with the click of a button.
                </p>
              </div>

              <div 
                className="feature-tile"
                style={{ display: activeTile === 3 ? 'block' : 'none' }}
              >
                <h2>Traits-based Search Query System</h2>
                <p>
                  Find exactly what you're looking for with our flexible search system.
                  Search by any combination of product traits—brand, keywords, tags—to pinpoint the right toy, 
                  even when you don’t know its name.
                </p>
              </div>
            </div>

            <button className="carousel-nav-btn next-btn" onClick={handleNextTile}>
              <img src={nextIcon} alt="Next" />
            </button>
          </div>

          <div className="carousel-dots">
            <button 
              className={`dot ${activeTile === 1 ? 'active' : ''}`} 
              onClick={() => setActiveTile(1)}
            />
            <button 
              className={`dot ${activeTile === 2 ? 'active' : ''}`} 
              onClick={() => setActiveTile(2)}
            />
            <button 
              className={`dot ${activeTile === 3 ? 'active' : ''}`} 
              onClick={() => setActiveTile(3)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
