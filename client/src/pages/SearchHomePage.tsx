import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchHomePage.css';

function SearchHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // navigate to search results or handle search
      console.log('Searching for:', searchQuery);
      // TODO: Implement search functionality
    }
  };

  return (
    <div className="search-home-page">
      <div className="search-home-container">
        <h1 className="search-home-title">DandelionDB</h1>
        <p className="search-home-subtitle">Search for products in your database</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, UPC, or SKU..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SearchHomePage;
