import React, { useState, useEffect } from 'react';
import { Globe, Camera, MessageCircle, Store, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ConnectCards = () => {
  const [connections, setConnections] = useState({
    facebook: false,
    instagram: false, // For simplicity we tie IG to FB right now
    whatsapp: false,
    google: false
  });
  const [fbPageName, setFbPageName] = useState('');
  const [fbPageId, setFbPageId] = useState('');

  const handleManage = (platform, accountId) => {
    alert(`--- ${platform.charAt(0).toUpperCase() + platform.slice(1)} Connection Details ---\nProvider: ${platform}\nAccount ID: ${accountId}\nStatus: Active\n\n(More management options coming soon)`);
  };

  const fetchConnectionStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/api/connections/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.facebook) {
          setConnections(prev => ({ ...prev, facebook: true, instagram: true }));
          setFbPageName(data.facebook_page_name);
          setFbPageId(data.facebook_page_id || 'Connected');
        }
      })
      .catch(console.error);

    fetch(`${API_BASE_URL}/api/auth/google/status`)
      .then(res => res.json())
      .then(data => {
        if (data.connected) {
          setConnections(prev => ({ ...prev, google: true }));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const handleGoogleConnect = () => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(`${API_BASE_URL}/api/auth/google`, 'Google Auth', `width=${width},height=${height},top=${top},left=${left}`);
    
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/api/auth/google/status`)
        .then(res => res.json())
        .then(data => {
          if (data.connected) {
            setConnections(prev => ({ ...prev, google: true }));
            clearInterval(interval);
          }
        })
        .catch(console.error);
    }, 3000);
    setTimeout(() => clearInterval(interval), 120000);
  };

  const handleFacebookConnect = () => {
    const token = localStorage.getItem('token');
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(`${API_BASE_URL}/api/auth/facebook?token=${token}`, 'Facebook Auth', `width=${width},height=${height},top=${top},left=${left}`);
    
    // Poll for status
    const interval = setInterval(() => {
      fetchConnectionStatus();
      if (connections.facebook) clearInterval(interval);
    }, 3000);
    setTimeout(() => clearInterval(interval), 120000);
  };

  const toggleConnection = (platform) => {
    setConnections(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <div>
      <h2 className="page-title">Platform Connections</h2>
      <p className="page-subtitle mb-6">Manage your social media accounts and pages</p>
      
      <div className="grid-4" style={{ marginTop: '24px' }}>
        {/* Facebook */}
        <div className="glass-card social-card facebook">
          <div className="social-icon-wrapper">
            <Globe size={32} />
          </div>
          <div>
            <h3>{connections.facebook ? fbPageName : 'Facebook Page'}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {connections.facebook ? fbPageId : 'Not Connected'}</p>
          </div>
          <div className={`status-badge ${connections.facebook ? 'status-connected' : 'status-disconnected'}`}>
            <div className="status-dot"></div>
            {connections.facebook ? 'Connected' : 'Disconnected'}
          </div>
          {connections.facebook ? (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="btn btn-outline" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => handleManage('facebook', fbPageId)}>Manage</button>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => toggleConnection('facebook')}>Disconnect</button>
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleFacebookConnect}
              style={{ width: '100%' }}
            >
              Connect with Facebook
            </button>
          )}
        </div>

        {/* Instagram */}
        <div className="glass-card social-card instagram">
          <div className="social-icon-wrapper">
            <Camera size={32} />
          </div>
          <div>
            <h3>Instagram Profile</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{connections.instagram ? 'Linked via Facebook' : 'Not Connected'}</p>
          </div>
          <div className={`status-badge ${connections.instagram ? 'status-connected' : 'status-disconnected'}`}>
            <div className="status-dot"></div>
            {connections.instagram ? 'Connected' : 'Disconnected'}
          </div>
          {connections.instagram ? (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="btn btn-outline" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => handleManage('instagram', 'Linked Page')}>Manage</button>
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleFacebookConnect}
              style={{ width: '100%' }}
            >
              Connect via Facebook
            </button>
          )}
        </div>

        {/* WhatsApp */}
        <div className="glass-card social-card whatsapp">
          <div className="social-icon-wrapper">
            <MessageCircle size={32} />
          </div>
          <div>
            <h3>WhatsApp Business</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending Setup</p>
          </div>
          <div className={`status-badge ${connections.whatsapp ? 'status-connected' : 'status-disconnected'}`}>
            <div className="status-dot"></div>
            {connections.whatsapp ? 'Connected' : 'Disconnected'}
          </div>
          {connections.whatsapp ? (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="btn btn-outline" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => handleManage('whatsapp', '+91 0000000000')}>Manage</button>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => toggleConnection('whatsapp')}>Disconnect</button>
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={() => toggleConnection('whatsapp')}
              style={{ width: '100%' }}
            >
              Connect
            </button>
          )}
        </div>

        {/* Google Business */}
        <div className="glass-card social-card google">
          <div className="social-icon-wrapper">
            <Store size={32} />
          </div>
          <div>
            <h3>Google Business</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending Setup</p>
          </div>
          <div className={`status-badge ${connections.google ? 'status-connected' : 'status-disconnected'}`}>
            <div className="status-dot"></div>
            {connections.google ? 'Connected' : 'Disconnected'}
          </div>
          {connections.google ? (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="btn btn-outline" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => handleManage('google', 'Pending Setup')}>Manage</button>
              <button className="btn btn-outline" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => toggleConnection('google')}>Disconnect</button>
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleGoogleConnect}
              style={{ width: '100%' }}
            >
              Setup Profile
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default ConnectCards;
