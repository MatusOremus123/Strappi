import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        navigate('/login');
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        setUser(user);
        
        // Try to get extended profile
        const profileResponse = await apiService.getUserProfile(user.id);
        if (profileResponse.data.data.length > 0) {
          setProfile(profileResponse.data.data[0]);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!user) return <div className="error">Please log in to view your profile</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>
        
        {/* Basic User Info */}
        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="profile-info">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role?.name || 'User'}</p>
            <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Extended Profile Info */}
        {profile && (
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="profile-info">
              <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
              {profile.birthday && (
                <p><strong>Birthday:</strong> {new Date(profile.birthday).toLocaleDateString()}</p>
              )}
              {profile.primary_language && (
                <p><strong>Primary Language:</strong> {profile.primary_language}</p>
              )}
              {profile.phone_number && (
                <p><strong>Phone:</strong> {profile.phone_number}</p>
              )}
            </div>
          </div>
        )}

        {/* Accessibility Info */}
        {profile?.disability_card && (
          <div className="profile-section">
            <h2>Accessibility Information</h2>
            <div className="profile-info">
              <p><strong>Disability Card Status:</strong> {profile.disability_card.card_status}</p>
              {profile.disability_card.issuing_card && (
                <p><strong>Issuing Authority:</strong> {profile.disability_card.issuing_card}</p>
              )}
              {profile.disability_card.expiry_date && (
                <p><strong>Expiry Date:</strong> {new Date(profile.disability_card.expiry_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}

        {/* Role-specific features */}
        {user.role?.name === 'Event Attendee' && (
          <div className="profile-section">
            <h2>My Events</h2>
            <p>Here you can view events you've registered for.</p>
            {/* TODO: Add list of user's tickets/events */}
          </div>
        )}

        {user.role?.name === 'Event Organizer' && (
          <div className="profile-section">
            <h2>My Events</h2>
            <p>Here you can manage events you've created.</p>
            <button className="btn-primary">Create New Event</button>
            {/* TODO: Add list of user's created events */}
          </div>
        )}

        {user.role?.name === 'System Admin' && (
          <div className="profile-section">
            <h2>Admin Tools</h2>
            <p>Access admin features and manage the system.</p>
            <button className="btn-primary">Manage Users</button>
            <button className="btn-primary">Approve Role Requests</button>
            {/* TODO: Add admin tools */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;