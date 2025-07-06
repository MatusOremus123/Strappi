import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      setMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }

    // Validate business justification for elevated roles
    if (formData.intendedRole !== 'attendee' && !formData.businessJustification.trim()) {
      setMessage({ type: 'error', text: 'Please provide justification for requesting elevated access' });
      return;
    }

    // Validate disability card requirements
    if (formData.hasDisability && !disabilityCardFile) {
      setMessage({ type: 'error', text: 'Please upload your disability card' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Starting registration process...');
      
      // Step 1: Register user with Strapi auth first
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      console.log('Sending registration data:', userData);
      
      const authResponse = await apiService.register(userData);
      console.log('Registration response:', authResponse.data);
      
      const userId = authResponse.data.user.id;
      const userToken = authResponse.data.jwt;
      console.log('User ID:', userId);

      // Store the token temporarily for the update operations
      const originalToken = localStorage.getItem('authToken');
      localStorage.setItem('authToken', userToken);

      // Step 2: Try to get roles and assign Event Attendee
      try {
        console.log('Fetching roles...');
        const rolesResponse = await apiService.getRoles();
        console.log('Roles response:', rolesResponse.data);
        
        const roles = rolesResponse.data.roles;
        console.log('Available roles:', roles.map(r => r.name));
        
        const eventAttendeeRole = roles.find(role => role.name === 'Event Attendee');
        console.log('Event Attendee role found:', eventAttendeeRole);
        
        if (eventAttendeeRole) {
          console.log('Assigning Event Attendee role to user', userId);
          await apiService.updateUserRole(userId, eventAttendeeRole.id);
          console.log('Role assigned successfully to Event Attendee');
        } else {
          console.log('Event Attendee role not found - available roles:', roles.map(r => r.name));
        }
      } catch (roleError) {
        console.error('Role assignment failed:', roleError);
        console.error('Role error details:', roleError.response?.data);
        // Continue anyway - user still has basic auth
      }

      let disabilityCardSaved = false;

      // Step 3: Add disability card information if provided
      if (formData.hasDisability) {
        try {
          console.log('Adding disability card information to user...');
          
          let uploadedFile = null;
          if (disabilityCardFile) {
            console.log('Uploading disability card file...');
            uploadedFile = await uploadDisabilityCard();
            console.log('File uploaded:', uploadedFile);
          }

          // Prepare disability card data as direct fields (matching profile structure)
          const disabilityUpdateData = {
            disability_card_status: formData.disabilityCardStatus || 'Active',
            ...(formData.issuingCard && { disability_issuing_authority: formData.issuingCard }),
            ...(formData.disabilityCardExpiry && { disability_card_expiry: formData.disabilityCardExpiry }),
            ...(uploadedFile && { disability_card_file: uploadedFile.id })
          };

          console.log('Disability card data to save:', disabilityUpdateData);

          // Try different update methods (same as profile logic)
          try {
            console.log('Attempting updateUser method...');
            const response = await apiService.updateUser(userId, disabilityUpdateData);
            console.log('User updated with disability card via updateUser:', response.data);
            disabilityCardSaved = true;
          } catch (updateUserError) {
            console.error('updateUser failed, trying updateCurrentUser:', updateUserError);
            
            try {
              console.log('Attempting updateCurrentUser method...');
              const response = await apiService.updateCurrentUser(disabilityUpdateData);
              console.log('User updated with disability card via updateCurrentUser:', response.data);
              disabilityCardSaved = true;
            } catch (updateCurrentUserError) {
              console.error('updateCurrentUser also failed, trying put to /users/me:', updateCurrentUserError);
              
              try {
                // Direct API call as last resort
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:1337'}/api/users/me`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                  },
                  body: JSON.stringify(disabilityUpdateData)
                });
                
                if (response.ok) {
                  const data = await response.json();
                  console.log('User updated via direct API call:', data);
                  disabilityCardSaved = true;
                } else {
                  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
              } catch (directApiError) {
                console.error('Direct API call also failed:', directApiError);
                throw directApiError;
              }
            }
          }
          
        } catch (disabilityError) {
          console.error('Failed to save disability card information:', disabilityError);
          console.error('Disability error details:', disabilityError.response?.data);
          
          // Don't fail the whole registration - user is still created
          console.log('Registration will continue, but disability card was not saved');
          disabilityCardSaved = false;
        }
      }

      // Restore original token
      if (originalToken) {
        localStorage.setItem('authToken', originalToken);
      } else {
        localStorage.removeItem('authToken');
      }

      // Success message based on what was saved
      let successMessage = 'Registration successful! You can now log in.';
      
      if (formData.hasDisability) {
        if (disabilityCardSaved) {
          successMessage = 'Registration successful! Your accessibility information has been saved. You can now log in and manage your event participation.';
        } else {
          successMessage = 'Registration successful! However, there was an issue saving your disability card information. You can add it from your profile page after logging in.';
        }
      }

      setMessage({ 
        type: disabilityCardSaved || !formData.hasDisability ? 'success' : 'warning', 
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
      console.error('Registration error details:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle specific error types
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid registration data. Please check your information and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
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
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Pending">Pending Renewal</option>
                      <option value="Suspended">Suspended</option>
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
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>

      <style jsx>{`
        .message.warning {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fbbf24;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Register;