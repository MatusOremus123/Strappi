import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

const Home = () => {
  const { t } = useTranslation();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalOrganizers: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent events for homepage
        const eventsResponse = await apiService.getEvents();
        const events = eventsResponse.data.data;
        
        // Get upcoming events (limit to 3 for featured section)
        const now = new Date();
        const upcomingEvents = events
          .filter(event => new Date(event.start_time) > now)
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          .slice(0, 3);
        
        setFeaturedEvents(upcomingEvents);
        
        // Calculate stats
        const upcoming = events.filter(event => new Date(event.start_time) > now);
        const uniqueOrganizers = new Set(events.map(event => event.organizer?.id).filter(Boolean));
        
        setStats({
          totalEvents: events.length,
          upcomingEvents: upcoming.length,
          totalOrganizers: uniqueOrganizers.size
        });
        
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>{t('welcome')}</h1>
          <p className="hero-subtitle">
            {t('heroSubtitle')}
          </p>
          <div className="hero-actions">
            <Link to="/events" className="cta-button primary">
              {t('exploreEvents')}
            </Link>
            <Link to="/register" className="cta-button secondary">
              {t('joinCommunity')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{stats.totalEvents}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.upcomingEvents}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalOrganizers}</div>
            <div className="stat-label">Event Organizers</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">♿</div>
            <h3>Accessibility First</h3>
            <p>Full support for users with disabilities including document upload for accessibility cards and specialized event features.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Multilingual Support</h3>
            <p>Browse events and register in your preferred language with our comprehensive internationalization support.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Responsive</h3>
            <p>Access events and manage your registrations seamlessly across all devices - desktop, tablet, and mobile.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎫</div>
            <h3>Smart Ticketing</h3>
            <p>Advanced ticket management with different types, zones, pricing, and special accessibility accommodations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Detailed Venues</h3>
            <p>Comprehensive venue information including capacity, accessibility features, and interactive seat maps.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Community Driven</h3>
            <p>Connect with organizers and fellow attendees in a platform designed for inclusivity and engagement.</p>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="featured-events-section">
        <h2>Upcoming Featured Events</h2>
        {loading ? (
          <div className="loading">Loading featured events...</div>
        ) : featuredEvents.length > 0 ? (
          <div className="featured-events-grid">
            {featuredEvents.map((event) => (
              <div key={event.id} className="featured-event-card">
                <div className="event-date">
                  <div className="date-day">
                    {new Date(event.start_time).getDate()}
                  </div>
                  <div className="date-month">
                    {new Date(event.start_time).toLocaleDateString('en', { month: 'short' })}
                  </div>
                </div>
                <div className="event-content">
                  <h3>{event.name}</h3>
                  {event.event_type && (
                    <span className="event-type-badge">{event.event_type}</span>
                  )}
                  {event.organizer && (
                    <p className="event-organizer">
                      by {event.organizer.name}
                    </p>
                  )}
                  {event.event_location && (
                    <p className="event-location">
                      📍 {event.event_location.name}
                    </p>
                  )}
                  <p className="event-description">
                    {event.description && event.description.length > 0 
                      ? event.description[0]?.children[0]?.text?.substring(0, 120) + '...'
                      : 'Join this exciting event!'
                    }
                  </p>
                  <Link to={`/events/${event.documentId}`} className="event-link">
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-events">
            <p>No upcoming events at the moment. Check back soon!</p>
            <Link to="/events" className="cta-button">View All Events</Link>
          </div>
        )}
        
        {featuredEvents.length > 0 && (
          <div className="view-all-events">
            <Link to="/events" className="cta-button">View All Events</Link>
          </div>
        )}
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join our inclusive community and never miss an event that matters to you.</p>
        <div className="cta-actions">
          <Link to="/register" className="cta-button primary">
            Create Account
          </Link>
          <Link to="/events" className="cta-button secondary">
            Browse Events
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;