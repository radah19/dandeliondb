import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css';
import { apiClient } from '../services/api';
import validator from 'validator';
import { StatusCodes } from 'http-status-codes';
import { setCookie } from 'typescript-cookie';

function SignUpPage({setUser}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(''); // Clear any previous errors
    
    if (!validator.isEmail(email)) {
      setSignupError("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 6) {
      setSignupError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    apiClient.fetch("/signup", {
      method: "POST",
      body: JSON.stringify({
          email: email,
          password: password
      })
    }).then(result => {
      if(result.status != StatusCodes.CREATED) {
        // Signup Failed
        if (result.status === StatusCodes.CONFLICT) {
          setSignupError("An account with this email already exists");
        } else {
          setSignupError("Sign up failed. Please try again.");
        }
        setIsLoading(false);
      } else {
        // Signup Successful!
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
          setSignupError("Sign up failed. Please try again.");
          setIsLoading(false);
        });
      }
    }).catch(err => {
      console.error("Signup error:", err);
      setSignupError("Unable to connect to server. Please try again.");
      setIsLoading(false);
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
            {signupError && (
              <div className="error-message">
                {signupError}
              </div>
            )}
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;

interface Props {
  setUser: (a: any) => void;
}