import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { apiClient } from '../services/api';
import validator from 'validator';
import { StatusCodes } from 'http-status-codes';
import { setCookie } from 'typescript-cookie';

function LoginPage({setUser}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); // Clear any previous errors
    
    if (!validator.isEmail(email)) {
      setLoginError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setLoginError("Please enter your password");
      return;
    }

    setIsLoading(true);

    apiClient.fetch("/login", {
      method: "POST",
      body: JSON.stringify({
          email: email,
          password: password
      })
    }).then(result => {
      if(result.status != StatusCodes.ACCEPTED) {
        // Login Failed
        setLoginError("Incorrect username or password");
        setIsLoading(false);
      } else {
        // Login Successful!
        result.text().then(body => {
          setCookie("sessionUser", JSON.stringify({
            email: email,
            sessionId: body.split("\n")[1]
          }));

          setUser({
            email: email
          });

          setIsLoading(false);
          navigate("/search-home");
        }).catch(err => {
          console.error("Error parsing response:", err);
          setLoginError("Login failed. Please try again.");
          setIsLoading(false);
        });
      }
    }).catch(err => {
      console.error("Login error:", err);
      setLoginError("Unable to connect to server. Please try again.");
      setIsLoading(false);
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <button className="back-button" onClick={() => navigate('/', { state: { from: 'auth' } })}>
          ← Back
        </button>
        <div className="login-tile">
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Email</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

interface Props {
  setUser: (a: any) => void;
}