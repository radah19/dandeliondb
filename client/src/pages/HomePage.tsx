import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomePage.css';
import dandelionGif1 from '../assets/dandeliongif1.gif';
import dandelionGif2 from '../assets/dandeliongif2.gif';
import dandelionGif3 from '../assets/dandeliongif3.gif';

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

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignUp = () => {
    navigate('/beta-signup');
  };

  const handleDatabaseClick = () => {
    navigate('/search-home');
  };

  return (
    <div className={`home-page ${shouldAnimate ? '' : 'no-animate'}`}> 
      <div className="hero-container">
        
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Simplify your toy store's workflow</h1>
            <p className="hero-description">
              The complete toy product database built for independent stores.
            </p>
          </div>
        </div>
        <div className="explore-section">
          <button className="explore-button" onClick={scrollToFeatures}>
            Explore
          </button>
          <button 
            className="signup-cta-button" 
            onClick={isLoggedIn ? handleDatabaseClick : handleSignUp}
          >
            {isLoggedIn ? 'Database' : 'Sign up for beta'}
          </button>
        </div>
      </div>
      
      <div className="features-section" ref={featuresRef}>
        <div className="tiles-container">
          <div 
            className={`feature-tile ${activeTile === 1 ? 'active' : ''}`}
            onClick={() => setActiveTile(1)}
          >
            <h2>Built for Independent Toy Stores</h2>
            <p>
              We know the struggle of dealing with incomplete product information from manufacturers.
              DandelionDB is specifically designed to handle messy, real-world data—helping you build and maintain
              your product catalog even when details are missing.
            </p>
          </div>

          <div 
            className={`feature-tile ${activeTile === 2 ? 'active' : ''}`}
            onClick={() => setActiveTile(2)}
          >
            <h2>Smart Autofill</h2>
            <p>
              Save time with our intelligent autofill system. As you type product information,
              DandelionDB suggests completions based on your existing catalog and common toy attributes,
              making data entry faster and more consistent.
            </p>
          </div>

          <div 
            className={`feature-tile ${activeTile === 3 ? 'active' : ''}`}
            onClick={() => setActiveTile(3)}
          >
            <h2>Traits-based Search Query System</h2>
            <p>
              Find exactly what you're looking for with our flexible search system.
              Search by any combination of product traits—age range, category, material, brand—even when
              some information is incomplete. Perfect for helping customers discover the right toys.
            </p>
          </div>
        </div>

        <div className="image-display">
          {activeTile === 1 && <img src={dandelionGif3} alt="Independent toy store" className="active-image" />}
          {activeTile === 2 && <img src={dandelionGif1} alt="Autofill feature" className="active-image" />}
          {activeTile === 3 && <img src={dandelionGif2} alt="Search system" className="active-image" />}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
