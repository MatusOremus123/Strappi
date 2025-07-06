import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.identifier || !formData.password) {
      setMessage({ type: 'error', text: 'Please enter both username/email and password' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Attempting login with:', formData);
      
      const response = await apiService.login(formData);
      console.log('Login response:', response.data);
      
      // Store auth token and user info
      const { jwt, user } = response.data;
      
      if (jwt && user) {
        localStorage.setItem('authToken', jwt);
        localStorage.setItem('user', JSON.stringify(user));
        
        setMessage({ 
          type: 'success', 
          text: 'Login successful! Redirecting...' 
        });
        
        // Use React Router navigate instead of window.location
        setTimeout(() => {
          navigate('/events');
        }, 1000);
      } else {
        throw new Error('Invalid login response - missing token or user data');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid username/email or password.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Sign In</h1>
        <p>Welcome back! Please sign in to your account.</p>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Username or Email *</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              placeholder="Enter your username or email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Create one here</Link>
          </p>
          <p>
            <a href="#forgot-password">Forgot your password?</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;