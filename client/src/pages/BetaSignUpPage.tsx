import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BetaSignUpPage.css';

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
    // TODO: Add API call to submit beta signup
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
            <div className="form-group">
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
            </div>
            <button type="submit" className="submit-button">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BetaSignUpPage;
