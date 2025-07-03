import React, { useState } from 'react';
import { apiService } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthday: '',
    primaryLanguage: 'en',
    intendedRole: 'attendee',
    businessJustification: '',
    hasDisability: false,
    disabilityCardNumber: '',
    disabilityCardStatus: '',
    disabilityCardExpiry: '',
    issuingCard: ''
  });
  const [disabilityCardFile, setDisabilityCardFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setDisabilityCardFile(e.target.files[0]);
  };

  const uploadDisabilityCard = async () => {
    if (!disabilityCardFile) return null;
    
    const formData = new FormData();
    formData.append('files', disabilityCardFile);
    
    try {
      const response = await apiService.uploadFile(formData);
      return response.data[0]; // Return first uploaded file
    } catch (err) {
      console.error('File upload error:', err);
      throw new Error('Failed to upload disability card');
    }
  };

  const createUserProfile = async (userId, uploadedFile) => {
    const profileData = {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        birthday: formData.birthday,
        prim_language: formData.primaryLanguage,
        email_address: formData.email,
        number: formData.disabilityCardNumber || null,
        disability_card: uploadedFile ? uploadedFile.id : null,
        status: formData.disabilityCardStatus || 'active',
        issuing_card: formData.issuingCard || null,
        expiry: formData.disabilityCardExpiry || null,
        users_permissions_user: userId
      }
    };

    try {
      await apiService.createUserProfile(profileData);
    } catch (err) {
      console.error('Profile creation error:', err);
      throw new Error('Failed to create user profile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }


    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    
    if (!formData.firstName || !formData.lastName) {
      setMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }

    
    if (formData.intendedRole !== 'attendee' && !formData.businessJustification.trim()) {
      setMessage({ type: 'error', text: 'Please provide justification for requesting elevated access' });
      return;
    }

    
    if (formData.hasDisability && !disabilityCardFile) {
      setMessage({ type: 'error', text: 'Please upload your disability card' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
    
      
    
    
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const authResponse = await apiService.register(userData);
      console.log('Registration response:', authResponse.data);
      
      const userId = authResponse.data.user.id;

      
      let uploadedFile = null;
      if (formData.hasDisability && disabilityCardFile) {
        uploadedFile = await uploadDisabilityCard();
      }

      
      await createUserProfile(userId, uploadedFile);

      
      if (formData.intendedRole !== 'attendee') {
        await apiService.createRoleRequest({
          data: {
            user: userId,
            requested_role: formData.intendedRole,
            justification: formData.businessJustification,
            status: 'pending'
          }
        });
      }
      
      const successMessage = formData.intendedRole === 'attendee' 
        ? 'Registration successful! You can now log in and browse events.'
        : `Registration successful! Your ${formData.intendedRole.replace('_request', '')} role request has been submitted for admin approval. You can browse events while waiting for approval.`;
      
      setMessage({ 
        type: 'success', 
        text: successMessage
      });
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        birthday: '',
        primaryLanguage: 'en',
        intendedRole: 'attendee',
        businessJustification: '',
        hasDisability: false,
        disabilityCardNumber: '',
        disabilityCardStatus: '',
        disabilityCardExpiry: '',
        issuingCard: ''
      });
      setDisabilityCardFile(null);
      
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>
        <p>Register for an account to manage your event participation</p>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* Basic Information */}
          <fieldset>
            <legend>Basic Information</legend>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthday">Birthday</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                placeholder="Select your birthday"
              />
            </div>

            <div className="form-group">
              <label htmlFor="primaryLanguage">Primary Language</label>
              <select
                id="primaryLanguage"
                name="primaryLanguage"
                value={formData.primaryLanguage}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </fieldset>

          {/* Account Type Request */}
          <fieldset>
            <legend>Account Information</legend>
            
            <div className="form-group">
              <label htmlFor="intendedRole">What do you plan to use this account for?</label>
              <select
                id="intendedRole"
                name="intendedRole"
                value={formData.intendedRole}
                onChange={handleChange}
              >
                <option value="attendee">Attending events</option>
                <option value="organizer_request">Organizing events (requires approval)</option>
                <option value="venue_request">Managing venues (requires approval)</option>
              </select>
              <small>Note: Organizer and venue manager accounts require admin approval</small>
            </div>

            {(formData.intendedRole === 'organizer_request' || formData.intendedRole === 'venue_request') && (
              <div className="form-group">
                <label htmlFor="businessJustification">Why do you need this access?</label>
                <textarea
                  id="businessJustification"
                  name="businessJustification"
                  value={formData.businessJustification}
                  onChange={handleChange}
                  placeholder="Please explain your organization, events you plan to create, or venues you manage..."
                  rows="4"
                  required
                />
              </div>
            )}
          </fieldset>

          {/* Account Credentials */}
          <fieldset>
            <legend>Account Credentials</legend>
            
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </fieldset>

          {/* Accessibility Information */}
          <fieldset>
            <legend>Accessibility Information</legend>
            
            <div className="form-group checkbox-group">
              <label htmlFor="hasDisability">
                <input
                  type="checkbox"
                  id="hasDisability"
                  name="hasDisability"
                  checked={formData.hasDisability}
                  onChange={handleChange}
                />
                I have accessibility needs and possess a disability card
              </label>
            </div>

            {formData.hasDisability && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="disabilityCardNumber">Disability Card Number</label>
                    <input
                      type="text"
                      id="disabilityCardNumber"
                      name="disabilityCardNumber"
                      value={formData.disabilityCardNumber}
                      onChange={handleChange}
                      placeholder="Enter card number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="disabilityCardStatus">Card Status</label>
                    <select
                      id="disabilityCardStatus"
                      name="disabilityCardStatus"
                      value={formData.disabilityCardStatus}
                      onChange={handleChange}
                    >
                      <option value="">Select status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="pending">Pending Renewal</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="issuingCard">Issuing Authority</label>
                    <input
                      type="text"
                      id="issuingCard"
                      name="issuingCard"
                      value={formData.issuingCard}
                      onChange={handleChange}
                      placeholder="e.g., City Health Department"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="disabilityCardExpiry">Card Expiry Date</label>
                    <input
                      type="date"
                      id="disabilityCardExpiry"
                      name="disabilityCardExpiry"
                      value={formData.disabilityCardExpiry}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="disabilityCard">Upload Disability Card *</label>
                  <input
                    type="file"
                    id="disabilityCard"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required={formData.hasDisability}
                  />
                  {disabilityCardFile && (
                    <div className="file-info">
                      <p>Selected: {disabilityCardFile.name}</p>
                      <p>Size: {(disabilityCardFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  )}
                  <small>Accepted formats: PDF, JPG, PNG (max 5MB)</small>
                </div>
              </>
            )}
          </fieldset>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account? <a href="/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;