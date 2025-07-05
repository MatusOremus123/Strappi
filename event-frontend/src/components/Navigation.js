import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const Navigation = () => {
  const [user, setUser] = useState(null);
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
    navigate('/');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          🎭 Event Management
        </Link>
        
        <div className="nav-links">
          <Link to="/events">Events</Link>
          
          {user ? (
            // Logged in navigation
            <>
              <span className="nav-welcome">Welcome, {user.username}</span>
              <span className="nav-role">{user.role?.name || 'User'}</span>
              
              {/* Show different links based on role */}
              {user.role?.name === 'Event Organizer' && (
                <Link to="/create-event" className="nav-link-special">
                  ✨ Create Event
                </Link>
              )}
              
              {user.role?.name === 'System Admin' && (
                <Link to="/admin" className="nav-link-special">
                  ⚙️ Admin Panel
                </Link>
              )}
              
              <Link to="/profile">👤 My Profile</Link>
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          ) : (
            // Not logged in navigation
            <>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;