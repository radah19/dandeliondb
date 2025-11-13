import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>DandelionDB</h1>
        <div className="nav-buttons">
          <button className="nav-button login-button" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
