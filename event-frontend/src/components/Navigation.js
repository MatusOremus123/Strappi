import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navigation = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simple check for auth status
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          console.error('Error parsing user data:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Listen for custom auth events
    window.addEventListener('auth-changed', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-changed', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('auth-changed'));
    
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
          🎭 {t('appName')}
        </Link>
        
        {/* Mobile hamburger button */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <Link to="/events" onClick={closeMobileMenu}>{t('events')}</Link>
          
          {user ? (
            // Logged in navigation
            <>
              <div className="nav-user-info">
                <span className="nav-welcome">{t('welcome')}, {user.username}</span>
                <span className="nav-role">{user.role?.name || 'User'}</span>
              </div>
              
              {/* Show different links based on role */}
              {user.role?.name === 'Event Organizer' && (
                <Link to="/create-event" className="nav-link-special" onClick={closeMobileMenu}>
                  ✨ Create Event
                </Link>
              )}
              
              {user.role?.name === 'System Admin' && (
                <Link to="/admin" className="nav-link-special" onClick={closeMobileMenu}>
                  ⚙️ Admin Panel
                </Link>
              )}
              
              <Link to="/profile" onClick={closeMobileMenu}>👤 {t('myProfile')}</Link>
              <button onClick={handleLogout} className="nav-logout">
                {t('logout')}
              </button>
            </>
          ) : (
            // Not logged in navigation
            <>
              <Link to="/login" onClick={closeMobileMenu}>{t('login')}</Link>
              <Link to="/register" onClick={closeMobileMenu}>{t('register')}</Link>
            </>
          )}
          
          <div className="nav-language-wrapper">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </nav>
  );
};

export default Navigation;