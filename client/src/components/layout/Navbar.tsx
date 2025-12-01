import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useEffect } from 'react';
import { apiClient } from '../../services/api';
import { StatusCodes } from 'http-status-codes';
import { removeCookie } from 'typescript-cookie';

function Navbar({user, setUser}: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log(user);
  }, [user])

  const logout = (e: React.FormEvent) => {
    e.preventDefault();

    apiClient.fetch("/logout", {
      method: "POST",
      body: JSON.stringify({
          email: user.email,
      })
    }).then(result => {
      if(result.status != StatusCodes.OK) {
        // Logout Failed
        console.log("SADNESS!!");
      } else {
        // Logout Successful!
        console.log("Yipee!");
        removeCookie("sessionUser");
        result.text().then(() => {
          setUser({
            email: ""
          })

          navigate("/");
        });
      }
    });
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h1 className="nav-logo">DandelionDB</h1>
          <img src='/dandeliondb_flower.svg' />
        </div>
          {
            (user != undefined && user.email != undefined && user.email !== "") ?
              // User is logged in!
              <div className="nav-buttons">
                <button className="nav-button login-button" onClick={logout}>Logout</button>
                <p className="nav-logged-in-text">{user.email}</p>
              </div>
            :
              // User not logged in
              <div className="nav-buttons">
                <button className="nav-button login-button" onClick={() => navigate('/login')}>Login</button>
                <button className="nav-button login-button" onClick={() => navigate('/signup')}>Signup</button>
              </div>
          }
          
      </div>
    </nav>
  );
}

export default Navbar;

interface Props {
  user: any,
  setUser: (a: any) => void;
}