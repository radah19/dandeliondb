import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css';
import { apiClient } from '../services/api';
import validator from 'validator';
import { StatusCodes } from 'http-status-codes';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement sign-up logic
    console.log('Sign up:', { email, password });

    if (!validator.isEmail(email)) {
      console.log("Email not provided!");
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
        console.log("SADNESS!!");
      } else {
        // Signup Successful!
        console.log("Yipee!");
      }
    });
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <button className="back-button" onClick={() => navigate('/', { state: { from: 'auth' } })}>
          ← Back
        </button>
        <div className="signup-tile">
          <h2 className="signup-title">Sign Up</h2>
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
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
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
