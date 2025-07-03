import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

const Events = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Remove any locale parameter for now
        const response = await apiService.getEvents();
        console.log('Events response:', response.data);
        setEvents(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.event_type && event.event_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">{t('error')}: {error}</div>;

  return (
    <div className="events-page">
      <h1>{t('events')}</h1>
      
      <div className="search-section">
        <input
          type="text"
          placeholder={t('searchEvents')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="no-events">
          {searchTerm ? t('noEventsMatch') : t('noEvents')}
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.name}</h3>
              <p className="event-date">
                📅 {new Date(event.start_time).toLocaleDateString()}
              </p>
              {event.event_type && (
                <span className="event-type">{event.event_type}</span>
              )}
              {event.organizer && (
                <p className="event-organizer">
                  👥 {event.organizer.name}
                </p>
              )}
              {event.event_location && (
                <p className="event-location">
                  📍 {event.event_location.name}
                </p>
              )}
              <p className="event-description">
                {event.description && event.description.length > 0 
                  ? event.description[0]?.children[0]?.text?.substring(0, 100) + '...'
                  : 'No description available'
                }
              </p>
              <Link to={`/events/${event.documentId}`} className="view-details-btn">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;