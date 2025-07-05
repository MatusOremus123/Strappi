import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // 'account' or 'accessibility'
  const [formData, setFormData] = useState({});
  const [fileUpload, setFileUpload] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        navigate('/login');
        return;
      }

      try {
        // Use the current authenticated user endpoint
        const userResponse = await apiService.getMe();
        console.log('User response:', userResponse);
        
        if (userResponse.data && isMounted) {
          setUser(userResponse.data);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        // Fallback to localStorage data if API fails
        try {
          const user = JSON.parse(userData);
          if (isMounted) setUser(user);
        } catch (parseErr) {
          console.error('Error parsing user data:', parseErr);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleEditStart = (section) => {
    setEditingSection(section);
    setIsEditing(true);
    
    if (section === 'account') {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
    } else if (section === 'accessibility') {
      setFormData({
        card_status: user?.disability_card?.card_status || '',
        issuing_card: user?.disability_card?.issuing_card || '',
        expiry_date: user?.disability_card?.expiry_date ? 
          new Date(user.disability_card.expiry_date).toISOString().split('T')[0] : ''
      });
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingSection(null);
    setFormData({});
    setFileUpload(null);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    console.log('Starting account update with data:', formData);

    try {
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      console.log('Sending update data:', updateData);

      // Skip /users/me endpoint and go directly to the user ID endpoint
      console.log('Using direct user update with ID:', user.id);
      const response = await apiService.updateUser(user.id, updateData);
      console.log('Direct user update response:', response);
      
      if (response?.data) {
        console.log('Update successful, updating local state...');
        
        // Refresh user data from server to get the latest info
        const refreshedUser = await apiService.getMe();
        console.log('Refreshed user data:', refreshedUser);
        
        if (refreshedUser.data) {
          localStorage.setItem('user', JSON.stringify(refreshedUser.data));
          setUser(refreshedUser.data);
        }
        
        setMessage({ type: 'success', text: 'Account information updated successfully!' });
        setIsEditing(false);
        setEditingSection(null);
        setFormData({});
      } else {
        console.log('No response data received');
        setMessage({ type: 'error', text: 'Update failed - no response data' });
      }
    } catch (error) {
      console.error('Account update error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to update account information';
      
      if (error.response?.status === 403) {
        errorMessage = 'Permission denied. You may not have permission to update user information.';
      } else if (error.response?.status === 405) {
        errorMessage = 'Method not allowed. User updates may be disabled.';
      } else if (error.response?.status === 400) {
        const details = error.response.data?.error?.details || error.response.data?.message;
        errorMessage = `Invalid data: ${details || 'Please check your input.'}`;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUpdating(false);
    }
  };

  const handleAccessibilityUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    console.log('Starting accessibility update with data:', formData);
    console.log('File upload:', fileUpload);

    try {
      let fileData = null;
      
      // Handle file upload if a new file is selected
      if (fileUpload) {
        console.log('Uploading file...');
        const formDataFile = new FormData();
        formDataFile.append('files', fileUpload);
        
        try {
          const fileResponse = await apiService.uploadFile(formDataFile);
          console.log('File upload response:', fileResponse);
          if (fileResponse.data && fileResponse.data.length > 0) {
            fileData = fileResponse.data[0];
            console.log('File uploaded successfully:', fileData);
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          setMessage({ type: 'error', text: 'Failed to upload file. Please try again.' });
          setUpdating(false);
          return;
        }
      }

      // Prepare disability card data as component
      const disabilityCardData = {
        card_status: formData.card_status,
        issuing_card: formData.issuing_card,
        expiry_date: formData.expiry_date || null
      };

      // IMPORTANT: Include the existing ID for component updates
      if (user?.disability_card?.id) {
        disabilityCardData.id = user.disability_card.id;
      }

      // Handle file data
      if (fileData) {
        console.log('Adding new file to disability card data');
        disabilityCardData.file = fileData.id;
      } else if (user?.disability_card?.file) {
        console.log('Keeping existing file');
        disabilityCardData.file = user.disability_card.file.id || user.disability_card.file;
      }

      console.log('Final disability card data:', disabilityCardData);

      // Update user with disability card component
      // For users-permissions, we send the data directly
      const updateData = {
        disability_card: disabilityCardData
      };

      console.log('Sending update data to API:', updateData);

      try {
        const response = await apiService.updateUserWithDisabilityCard(user.id, updateData);
        console.log('Disability card update response:', response);
        
        if (response?.data) {
          console.log('Update successful, updating local state...');
          
          // Refresh user data from server
          const refreshedUser = await apiService.getMe();
          console.log('Refreshed user data:', refreshedUser);
          
          if (refreshedUser.data) {
            localStorage.setItem('user', JSON.stringify(refreshedUser.data));
            setUser(refreshedUser.data);
          }
          
          setMessage({ type: 'success', text: 'Accessibility information updated successfully!' });
          setIsEditing(false);
          setEditingSection(null);
          setFileUpload(null);
          setFormData({});
        } else {
          console.log('No response data received');
          setMessage({ type: 'error', text: 'Update failed - no response data' });
        }
      } catch (updateError) {
        console.error('User update failed:', updateError);
        console.error('Update error response:', updateError.response);
        
        let errorMessage = 'Failed to update accessibility information';
        
        if (updateError.response?.status === 403) {
          errorMessage = 'Permission denied. You may not have permission to update accessibility information.';
        } else if (updateError.response?.status === 400) {
          errorMessage = updateError.response.data?.error?.message || 'Invalid data provided.';
        } else if (updateError.response?.data?.error?.message) {
          errorMessage = updateError.response.data.error.message;
        }
        
        setMessage({ type: 'error', text: errorMessage });
      }
      
    } catch (error) {
      console.error('Error updating accessibility info:', error);
      let errorMessage = 'Failed to update accessibility information';
      
      if (error.response?.status === 403) {
        errorMessage = 'Permission denied. You may not have permission to update this information.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error?.message || 'Invalid data provided.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!user) return <div className="error">Please log in to view your profile</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Account Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Account Information</h2>
            {!isEditing && (
              <button 
                className="edit-button"
                onClick={() => handleEditStart('account')}
              >
                Edit
              </button>
            )}
          </div>

          {isEditing && editingSection === 'account' ? (
            <form onSubmit={handleAccountUpdate} className="edit-form">
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={updating} className="save-button">
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleEditCancel} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role?.name || 'User'}</p>
              <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Accessibility Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Accessibility Information</h2>
            {!isEditing && (
              <button 
                className="edit-button"
                onClick={() => handleEditStart('accessibility')}
              >
                {user?.disability_card ? 'Edit' : 'Add'}
              </button>
            )}
          </div>

          {isEditing && editingSection === 'accessibility' ? (
            <form onSubmit={handleAccessibilityUpdate} className="edit-form">
              <div className="form-group">
                <label htmlFor="card_status">Card Status:</label>
                <select
                  id="card_status"
                  name="card_status"
                  value={formData.card_status}
                  onChange={handleInputChange}
                >
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="issuing_card">Issuing Authority:</label>
                <input
                  type="text"
                  id="issuing_card"
                  name="issuing_card"
                  value={formData.issuing_card}
                  onChange={handleInputChange}
                  placeholder="e.g., Department of Health"
                />
              </div>
              <div className="form-group">
                <label htmlFor="expiry_date">Expiry Date:</label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Card Document:</label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                {user?.disability_card?.file && !fileUpload && (
                  <p className="current-file">
                    Current: {user.disability_card.file.name || 'Document uploaded'}
                  </p>
                )}
                {fileUpload && (
                  <p className="new-file">New file selected: {fileUpload.name}</p>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" disabled={updating} className="save-button">
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleEditCancel} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {user?.disability_card ? (
                <div className="profile-info">
                  <div className="disability-card-info">
                    <p><strong>Status:</strong> <span className="status-badge">
                      {user.disability_card.card_status || 'Not specified'}
                    </span></p>

                    {user.disability_card.issuing_card && (
                      <p><strong>Issuing Authority:</strong> {user.disability_card.issuing_card}</p>
                    )}

                    {user.disability_card.expiry_date && (
                      <p><strong>Expiry Date:</strong> {new Date(user.disability_card.expiry_date).toLocaleDateString()}</p>
                    )}

                    {user.disability_card.file ? (
                      <div className="card-file-info">
                        <p><strong>Card Document:</strong> 
                          <span className="file-uploaded">✅ {user.disability_card.file.name || 'Document uploaded'}</span>
                        </p>
                        {user.disability_card.file.url && (
                          <p>
                            <a 
                              href={`${process.env.REACT_APP_API_URL || 'http://localhost:1337'}${user.disability_card.file.url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              View Document
                            </a>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p><strong>Card Document:</strong> <span className="no-file">No document uploaded</span></p>
                    )}

                    <div className="accessibility-note">
                      <p><strong>Note:</strong> Your disability card information helps us provide appropriate accessibility accommodations for events.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  <div className="no-accessibility-card">
                    <p className="no-info">No accessibility card on file.</p>
                    <p>If you have accessibility needs:</p>
                    <ul>
                      <li>Use the "Add" button above to add accessibility information</li>
                      <li>You can also add them during event registration</li>
                      <li>Contact support if you need assistance</li>
                    </ul>
                    <div className="accessibility-note">
                      <p><strong>Note:</strong> Accessibility information helps us provide appropriate accommodations for events you attend.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Role-specific Features */}
        {user.role?.name === 'Event Attendee' && (
          <div className="profile-section">
            <h2>My Events</h2>
            <p>Here you can view events you've registered for.</p>
            <div className="feature-placeholder">
              <p>🎫 <strong>Upcoming Events:</strong> Feature coming soon</p>
              <p>📅 <strong>Event History:</strong> Feature coming soon</p>
              <p>🎟️ <strong>My Tickets:</strong> Feature coming soon</p>
            </div>
          </div>
        )}

        {user.role?.name === 'Event Organizer' && (
          <div className="profile-section">
            <h2>Organizer Dashboard</h2>
            <p>Manage your events and view attendee information.</p>
            <div className="feature-placeholder">
              <p>✨ <strong>Create Event:</strong> Feature coming soon</p>
              <p>📊 <strong>Event Analytics:</strong> Feature coming soon</p>
              <p>👥 <strong>Attendee Management:</strong> Feature coming soon</p>
            </div>
          </div>
        )}

        {user.role?.name === 'System Admin' && (
          <div className="profile-section">
            <h2>Admin Tools</h2>
            <p>Access administrative features and system management.</p>
            <div className="feature-placeholder">
              <p>👥 <strong>User Management:</strong> Feature coming soon</p>
              <p>✅ <strong>Role Requests:</strong> Feature coming soon</p>
              <p>📈 <strong>System Analytics:</strong> Feature coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;