import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const Navigation = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
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