import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { apiClient } from '../services/api';
import validator from 'validator';
import { StatusCodes } from 'http-status-codes';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement login logic
    console.log('Login:', { email, password });

    if (!validator.isEmail(email)) {
      console.log("Email not provided!");
      return;
    }

    apiClient.fetch("/login", {
      method: "POST",
      body: JSON.stringify({
          email: email,
          password: password
      })
    }).then(result => {
      if(result.status != StatusCodes.ACCEPTED) {
        // Login Failed
        console.log("SADNESS!!");
      } else {
        // Login Successful!
        console.log("Yipee!");
      }
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
            <button type="submit" className="submit-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
