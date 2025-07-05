import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await apiService.getEvent(id);
        console.log('Event detail response:', response.data);
        setEvent(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const renderAccessibilityFeatures = (accessibilityFeatures) => {
    console.log('Raw accessibility features:', accessibilityFeatures);
    
    if (!accessibilityFeatures || accessibilityFeatures.length === 0) {
      return (
        <div className="accessibility-info">
          <p>No specific accessibility features listed for this event.</p>
          <p>For accessibility inquiries, please contact the event organizer.</p>
        </div>
      );
    }

    return (
      <div className="accessibility-info">
        <div className="accessibility-grid">
          {accessibilityFeatures.map((feature, index) => {
            console.log('Processing feature:', feature);
            
            // Handle the name field
            const featureName = feature?.name || `Feature ${index + 1}`;
            
            // Handle rich text description field
            let featureDescription = '';
            if (feature?.description && Array.isArray(feature.description)) {
              featureDescription = feature.description.map(paragraph => {
                if (paragraph.children && Array.isArray(paragraph.children)) {
                  return paragraph.children.map(child => child.text || '').join('');
                }
                return typeof paragraph === 'string' ? paragraph : '';
              }).join(' ');
            }
            
            // Handle media icon field
            let featureIcon = '';
            if (feature?.icon) {
              if (typeof feature.icon === 'string') {
                featureIcon = feature.icon;
              } else if (feature.icon.url) {
                // It's a media object, we'll show the image
                featureIcon = feature.icon.url;
              }
            }
            
            return (
              <div key={feature?.id || index} className="accessibility-feature-card">
                <div className="feature-header">
                  {featureIcon && (
                    <span className="feature-icon">
                      {featureIcon.startsWith('/') || featureIcon.startsWith('http') ? (
                        <img 
                          src={featureIcon.startsWith('/') ? `${process.env.REACT_APP_API_URL || 'http://localhost:1337'}${featureIcon}` : featureIcon} 
                          alt={featureName}
                          className="feature-icon-image"
                        />
                      ) : (
                        featureIcon
                      )}
                    </span>
                  )}
                  <h4>{featureName}</h4>
                </div>
                {featureDescription && (
                  <p className="feature-description">{featureDescription}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  return (
    <div className="event-detail">
      <Link to="/events" className="back-link">← Back to Events</Link>
      
      <div className="event-header">
        <h1>{event.name || 'Untitled Event'}</h1>
        {event.event_type && (
          <span className="event-type-badge">{event.event_type}</span>
        )}
      </div>

      <div className="event-info-container">
        <div className="event-section">
          <h3>📝 Description</h3>
          <div className="event-description">
            {event.description && event.description.length > 0 ? (
              event.description.map((paragraph, index) => (
                <p key={index}>
                  {paragraph.children ? 
                    paragraph.children.map((child, childIndex) => (
                      <span key={childIndex}>{child.text || ''}</span>
                    )) : 
                    (typeof paragraph === 'string' ? paragraph : '')
                  }
                </p>
              ))
            ) : (
              <p>No description available</p>
            )}
          </div>
        </div>

        <div className="event-section">
          <h3>📅 Date & Time</h3>
          <p><strong>Start:</strong> {new Date(event.start_time).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(event.end_time).toLocaleString()}</p>
        </div>

        {event.event_location && (
          <div className="event-section">
            <h3>📍 Location</h3>
            <p><strong>Venue:</strong> {event.event_location.name || 'Not specified'}</p>
            {event.event_location.address && event.event_location.address.length > 0 && (
              <p><strong>Address:</strong> {event.event_location.address[0]?.children[0]?.text}</p>
            )}
            {event.event_location.capacity && (
              <p><strong>Capacity:</strong> {event.event_location.capacity} people</p>
            )}
            {event.event_location.website && (
              <p><strong>Website:</strong> <a href={event.event_location.website} target="_blank" rel="noopener noreferrer">{event.event_location.website}</a></p>
            )}
          </div>
        )}

        <div className="event-section">
          <h3>👥 Organizer</h3>
          {event.organizer ? (
            <>
              {event.organizer.name ? (
                <p><strong>Name:</strong> {event.organizer.name}</p>
              ) : (
                <p><strong>Name:</strong> Not specified</p>
              )}
              {event.organizer.contact_email && (
                <p><strong>Email:</strong> {event.organizer.contact_email}</p>
              )}
              {event.organizer.type && (
                <p><strong>Type:</strong> {event.organizer.type}</p>
              )}
              {event.organizer.website && (
                <p><strong>Website:</strong> <a href={event.organizer.website} target="_blank" rel="noopener noreferrer">{event.organizer.website}</a></p>
              )}
              {event.organizer.contact_Phone && (
                <p><strong>Phone:</strong> {event.organizer.contact_Phone}</p>
              )}
            </>
          ) : (
            <p>No organizer information available</p>
          )}
        </div>

        {/* Accessibility Features Section */}
        <div className="event-section">
          <h3>♿ Accessibility Features</h3>
          {renderAccessibilityFeatures(event.accessibility_features)}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;