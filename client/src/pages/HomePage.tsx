import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import homepageOne from '../assets/dandeliongif1.gif';
import homepageTwo from '../assets/dandeliongif2.gif';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page"> 
      <div className="slogan-section">
        <p className="slogan">
          Simplify your toy store's workflow with our<br />
          complete and accurate toy details platform
        </p>
      </div>
      <div className="hero-section">
        <div className="hero-content">
          <div className="gif-container">
            <img src={homepageOne} alt="Homepage demo 1" className="demo-gif" />
            <img src={homepageTwo} alt="Homepage demo 2" className="demo-gif" />
          </div>
        </div>
      </div>
      <div className="button-section">
        <button className="auth-button login-button">Login</button>
        <button className="auth-button signup-button" onClick={() => navigate('/signup')}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default HomePage;
