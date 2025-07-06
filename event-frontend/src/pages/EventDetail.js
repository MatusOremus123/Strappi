import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Pass current language to API with explicit location population
        const response = await apiService.getEvent(id, i18n.language);
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
  }, [id, i18n.language]); // Re-fetch when language changes

  // Helper function to render rich text content
  const renderRichText = (richTextArray) => {
    if (!richTextArray || !Array.isArray(richTextArray)) return '';
    
    return richTextArray.map((paragraph, index) => {
      if (paragraph.children && Array.isArray(paragraph.children)) {
        return paragraph.children.map(child => child.text || '').join('');
      }
      return typeof paragraph === 'string' ? paragraph : '';
    }).join(' ');
  };

  const renderAccessibilityFeatures = (accessibilityFeatures) => {
    console.log('Raw accessibility features:', accessibilityFeatures);
    
    if (!accessibilityFeatures || accessibilityFeatures.length === 0) {
      return (
        <div className="accessibility-info">
          <p>{t('noAccessibilityFeatures')}</p>
          <p>{t('accessibilityInquiries')}</p>
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
            
            // Handle rich text description field using the helper function
            const featureDescription = renderRichText(feature?.description);
            
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

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">{t('error')}: {error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  return (
    <div className="event-detail">
      <Link to="/events" className="back-link">← {t('backToEvents')}</Link>
      
      <div className="event-header">
        <h1>{event.name || 'Untitled Event'}</h1>
        {event.event_type && (
          <span className="event-type-badge">{event.event_type}</span>
        )}
      </div>

      <div className="event-info-container">
        <div className="event-section">
          <h3>📝 {t('description')}</h3>
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
              <p>{t('noDescription')}</p>
            )}
          </div>
        </div>

        <div className="event-section">
          <h3>📅 {t('dateTime')}</h3>
          <p><strong>{t('start')}:</strong> {new Date(event.start_time).toLocaleString()}</p>
          <p><strong>{t('end')}:</strong> {new Date(event.end_time).toLocaleString()}</p>
        </div>

        {/* FIXED: Changed from event.event_location to event.location */}
        {event.location && (
          <div className="event-section">
            <h3>📍 {t('location')}</h3>
            <div className="location-details">
              <p><strong>{t('venue')}:</strong> {event.location.name || 'Not specified'}</p>
              
              {/* Full Address Display */}
              {(event.location.street_address || event.location.city) && (
                <div className="address-block">
                  <p><strong>{t('address')}:</strong></p>
                  <div className="address-content">
                    {event.location.street_address && <p>{event.location.street_address}</p>}
                    <p>
                      {event.location.city}
                      {event.location.state_province && `, ${event.location.state_province}`}
                      {event.location.postal_code && ` ${event.location.postal_code}`}
                    </p>
                    {event.location.country && <p>{event.location.country}</p>}
                  </div>
                </div>
              )}
              
              {/* Contact Information */}
              <div className="contact-info">
                {event.location.phone && (
                  <p><strong>{t('phone')}:</strong> 
                    <a href={`tel:${event.location.phone}`}>{event.location.phone}</a>
                  </p>
                )}
                
                {event.location.email && (
                  <p><strong>{t('email')}:</strong> 
                    <a href={`mailto:${event.location.email}`}>{event.location.email}</a>
                  </p>
                )}
                
                {event.location.website && (
                  <p><strong>{t('website')}:</strong> 
                    <a href={event.location.website} target="_blank" rel="noopener noreferrer">
                      {event.location.website}
                    </a>
                  </p>
                )}
              </div>

              {/* Venue Details */}
              <div className="venue-details">
                {event.location.capacity && (
                  <p><strong>{t('capacity')}:</strong> {event.location.capacity} people</p>
                )}
                
                {event.location.venue_type && (
                  <p><strong>{t('venueType')}:</strong> {event.location.venue_type.replace('_', ' ')}</p>
                )}
                
                {event.location.parking_available !== undefined && (
                  <p><strong>{t('parking')}:</strong> {event.location.parking_available ? t('available') : t('notAvailable')}</p>
                )}
              </div>

              {/* Location Description */}
              {event.location.description && (
                <div className="location-description">
                  <p><strong>{t('locationDescription')}:</strong></p>
                  <div className="description-content">
                    {Array.isArray(event.location.description) ? 
                      renderRichText(event.location.description) : 
                      event.location.description
                    }
                  </div>
                </div>
              )}

              {/* Public Transport */}
              {event.location.public_transport_access && (
                <div className="transport-info">
                  <p><strong>{t('publicTransport')}:</strong></p>
                  <div className="transport-content">
                    {Array.isArray(event.location.public_transport_access) ? 
                      renderRichText(event.location.public_transport_access) : 
                      event.location.public_transport_access
                    }
                  </div>
                </div>
              )}

              {/* Optional: Google Maps Link */}
              {(event.location.latitude && event.location.longitude) && (
                <div className="map-link">
                  <a 
                    href={`https://www.google.com/maps?q=${event.location.latitude},${event.location.longitude}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="map-button"
                  >
                    📍 {t('viewOnMap')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="event-section">
          <h3>👥 {t('organizer')}</h3>
          {event.organizers && event.organizers.length > 0 ? (
            <div className="organizers-list">
              {event.organizers.map((organizer, index) => (
                <div key={organizer.id || index} className="organizer-info">
                  {event.organizers.length > 1 && <h4>Organizer {index + 1}</h4>}
                  <p><strong>Name:</strong> {organizer.name || 'Not specified'}</p>
                  {organizer.contact_email && (
                    <p><strong>Email:</strong> {organizer.contact_email}</p>
                  )}
                  {organizer.type && (
                    <p><strong>Type:</strong> {organizer.type}</p>
                  )}
                  {organizer.website && (
                    <p><strong>{t('website')}:</strong> 
                      <a href={organizer.website} target="_blank" rel="noopener noreferrer">
                        {organizer.website}
                      </a>
                    </p>
                  )}
                  {organizer.contact_Phone && (
                    <p><strong>Phone:</strong> {organizer.contact_Phone}</p>
                  )}
                  {index < event.organizers.length - 1 && <hr className="organizer-separator" />}
                </div>
              ))}
            </div>
          ) : (
            <p>No organizer information available</p>
          )}
        </div>

        {/* Accessibility Features Section */}
        <div className="event-section">
          <h3>♿ {t('accessibilityFeatures')}</h3>
          {renderAccessibilityFeatures(event.accessibility_features)}
        </div>

        {/* Optional: Add media section if you want to display event images */}
        {event.media && event.media.length > 0 && (
          <div className="event-section">
            <h3>📸 {t('media')}</h3>
            <div className="event-media-grid">
              {event.media.map((mediaItem, index) => (
                <img 
                  key={mediaItem.id || index}
                  src={mediaItem.url.startsWith('/') ? 
                    `${process.env.REACT_APP_API_URL || 'http://localhost:1337'}${mediaItem.url}` : 
                    mediaItem.url
                  }
                  alt={mediaItem.alternativeText || `Event media ${index + 1}`}
                  className="event-media-image"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;