import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('files', selectedFile);
    
    try {
      const response = await apiService.uploadFile(formData);
      console.log('Upload response:', response.data);
      alert('Document uploaded successfully!');
      setSelectedFile(null);
      document.querySelector('input[type="file"]').value = '';
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
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

      <div className="event-info">
        <div className="event-section">
          <h3>📅 Date & Time</h3>
          <p><strong>Start:</strong> {new Date(event.start_time).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(event.end_time).toLocaleString()}</p>
        </div>

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
          <h3>📝 Description</h3>
          <div className="event-description">
            {event.description && event.description.length > 0 ? (
              event.description.map((paragraph, index) => (
                <p key={index}>{paragraph.children[0]?.text}</p>
              ))
            ) : (
              <p>No description available</p>
            )}
          </div>
        </div>

        <div className="event-section">
          <h3>📎 Upload Document</h3>
          <div className="upload-section">
            <input 
              type="file" 
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.png,.txt"
            />
            {selectedFile && (
              <div className="file-info">
                <p><strong>Selected:</strong> {selectedFile.name}</p>
                <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                <button 
                  onClick={uploadDocument} 
                  className="upload-btn"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;