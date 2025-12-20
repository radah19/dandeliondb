import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import BetaSignUpPage from './pages/BetaSignUpPage';
import SearchHomePage from './pages/SearchHomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import './App.css';
import { useState } from 'react';
import SessionLoginPage from './pages/SessionLoginPage';
import AboutPage from './pages/AboutPage';

function App() {
  const [user, setUser] = useState({
    email:''
  });
  const [verifyingLoginSession, setVerifyingLoginSession] = useState(true);

  return (
    verifyingLoginSession ? 
    // User Cached Session being confirmed
      <SessionLoginPage setUser={setUser} setVerifyingLoginSession={setVerifyingLoginSession}/>
    : // User logged in!
      <Routes>
        <Route path="/" element={<Layout user={user} setUser={setUser}/>}>
          <Route index element={<HomePage user={user} />} />
          <Route path="login" element={<LoginPage setUser={setUser}/>} />
          <Route path="signup" element={<SignUpPage setUser={setUser}/>} />
          <Route path="beta-signup" element={<BetaSignUpPage />} />
          <Route path="search-home" element={<SearchHomePage />} />
          <Route path="product/:name/:brand" element={<ProductDetailPage />} />
          <Route path="search" element={<div>Search Page - Coming Soon</div>} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Route>
      </Routes>
  );
}

export default App;
