import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, Ticket, Globe, Smartphone, Heart, ArrowRight, Clock } from 'lucide-react';
import { apiService } from '../services/api';

const Home = () => {
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
        
        const eventsResponse = await apiService.getEvents();
        const events = eventsResponse.data.data;
        
        const now = new Date();
        const upcomingEvents = events
          .filter(event => new Date(event.start_time) > now)
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          .slice(0, 3);
        
        setFeaturedEvents(upcomingEvents);
        
        const upcoming = events.filter(event => new Date(event.start_time) > now);
        const uniqueOrganizers = new Set(events.flatMap(event => 
          event.organizers?.map(org => org.id) || []
        ).filter(Boolean));
        
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
        <div className="hero-bg">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Events for <span className="highlight">Everyone</span>
          </h1>
          <p className="hero-subtitle">
            Discover accessible events in Berlin
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn-primary">
              <Calendar size={20} /> Explore Events
            </Link>
            <Link to="/register" className="btn-secondary">
              Join Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon"><Calendar size={32} /></div>
            <div className="stat-number">{stats.totalEvents}</div>
            <div className="stat-label">Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Clock size={32} /></div>
            <div className="stat-number">{stats.upcomingEvents}</div>
            <div className="stat-label">Coming Up</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Users size={32} /></div>
            <div className="stat-number">{stats.totalOrganizers}</div>
            <div className="stat-label">Organizers</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Heart size={48} /></div>
            <h3>Accessibility First</h3>
            <p>Full accessibility support for everyone</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Globe size={48} /></div>
            <h3>Multilingual</h3>
            <p>Available in multiple languages</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Smartphone size={48} /></div>
            <h3>Mobile Ready</h3>
            <p>Works perfectly on any device</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Ticket size={48} /></div>
            <h3>Smart Tickets</h3>
            <p>Easy booking and management</p>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="featured-events-section">
        <div className="section-header">
          <h2>Featured Events</h2>
          <Link to="/events" className="view-all-link">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="events-grid">
            {featuredEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <div className="event-date">
                    <span className="day">{new Date(event.start_time).getDate()}</span>
                    <span className="month">{new Date(event.start_time).toLocaleDateString('en', { month: 'short' })}</span>
                  </div>
                  {event.event_type && (
                    <span className="event-badge">{event.event_type}</span>
                  )}
                </div>
                
                <div className="event-body">
                  <h3 className="event-title">{event.name}</h3>
                  
                  <div className="event-meta">
                    {event.organizers && event.organizers.length > 0 && (
                      <div className="meta-item">
                        <Users size={16} />
                        <span>{event.organizers[0].name}
                          {event.organizers.length > 1 && ` +${event.organizers.length - 1}`}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="meta-item">
                        <MapPin size={16} />
                        <span>{event.location.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><Calendar size={64} /></div>
            <h3>No Events Yet</h3>
            <p>Check back soon for exciting events!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Join?</h2>
          <p>Start discovering amazing events today</p>
          <Link to="/register" className="cta-btn">
            Get Started
          </Link>
        </div>
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        }

        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
        }

        .hero-content {
          position: relative;
          text-align: center;
          color: white;
          z-index: 2;
          max-width: 600px;
          padding: 0 20px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .highlight {
          background: linear-gradient(45deg, #60a5fa, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.4rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .btn-primary {
          background: linear-gradient(45deg, #ff6b6b, #ffd93d);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border-color: white;
        }

        .btn-secondary:hover {
          background: white;
          color: #667eea;
        }

        /* Stats Section */
        .stats-section {
          padding: 4rem 0;
          background: #f8fafc;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 32px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
          border: 2px solid #f1f5f9;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: #3b82f6;
        }

        .stat-icon {
          color: #3b82f6;
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #718096;
          font-weight: 500;
        }

        /* Features Section */
        .features-section {
          padding: 4rem 0;
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 20px;
        }

        .features-section h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #2d3748;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 32px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }

        .feature-icon {
          color: #3b82f6;
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
        }

        .feature-card h3 {
          font-size: 1.3rem;
          margin-bottom: 0.8rem;
          color: #2d3748;
        }

        .feature-card p {
          color: #718096;
          line-height: 1.6;
        }

        /* Featured Events Section */
        .featured-events-section {
          padding: 4rem 0;
          background: #f8fafc;
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-header h2 {
          font-size: 2.2rem;
          color: #2d3748;
          margin: 0;
        }

        .view-all-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: background 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .view-all-link:hover {
          background: #3b82f6;
          color: white;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .event-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid #f1f5f9;
        }

        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
        }

        .event-date {
          text-align: center;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.8rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .event-date .day {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1;
        }

        .event-date .month {
          display: block;
          font-size: 0.9rem;
          opacity: 0.8;
          text-transform: uppercase;
        }

        .event-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          backdrop-filter: blur(10px);
        }

        .event-body {
          padding: 1.5rem;
        }

        .event-title {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #718096;
          font-size: 0.9rem;
        }

        .meta-item .icon {
          color: #3b82f6;
        }

        .event-footer {
          padding: 0 1.5rem 1.5rem;
        }

        .event-btn {
          display: inline-block;
          width: 100%;
          text-align: center;
          padding: 0.8rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .event-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #718096;
        }

        .empty-icon {
          color: #3b82f6;
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-btn {
          display: inline-block;
          background: white;
          color: #3b82f6;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .stats-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;