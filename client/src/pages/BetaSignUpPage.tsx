import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BetaSignUpPage.css';
import { apiClient } from '../services/api';
import { StatusCodes } from 'http-status-codes';
import validator from 'validator';

function BetaSignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Beta signup:', formData);

      if (!validator.isEmail(formData.email)) {
        console.log("Email not provided!");
        return;
      }

    apiClient.fetch("/waitlist-signup", {
      method: "POST",
      body: JSON.stringify({
          email: formData.email
      })
    }).then(result => {
      if(result.status != StatusCodes.OK) {
        // Waitlist signup Failed
        console.log("SADNESS!!");
      } else {
        // Waitlist signup Successful!
        console.log("Yipee!");
      }
    });
      
  };

  const handleBack = () => {
    navigate('/', { state: { from: 'auth' } });
  };

  return (
    <div className="beta-signup-page">
      <div className="beta-signup-container">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        <div className="beta-signup-tile">
          <h1 className="beta-signup-title">Sign Up for Beta</h1>
          <p className="beta-signup-p-text">If you're interested in talking with us about the product, we'd love to get in contact with you!</p>
          <form onSubmit={handleSubmit} className="beta-signup-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>
            {/* <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Enter your first name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Enter your last name"
              />
            </div> */}
            <button type="submit" className="submit-button" onClick={handleSubmit}>Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BetaSignUpPage;
