import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Key, Shield } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Settings = () => {
  const [geminiKey, setGeminiKey] = useState('');
  const [cloudflareToken, setCloudflareToken] = useState('');
  const [businessName, setBusinessName] = useState(localStorage.getItem('businessName') || 'Greenverse');
  const [businessSubtitle, setBusinessSubtitle] = useState(localStorage.getItem('businessSubtitle') || 'Adison DTF');
  const [ownerName, setOwnerName] = useState(localStorage.getItem('ownerName') || 'Adison');
  const [businessType, setBusinessType] = useState(localStorage.getItem('businessType') || 'DTF Printing');
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings/keys`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success && data.keys) {
          setGeminiKey(data.keys.gemini_api_key || '');
          setCloudflareToken(data.keys.cloudflare_api_token || '');
        }
      } catch (e) {
        console.error("Failed to fetch keys", e);
      }
    };
    fetchKeys();
  }, []);

  const handleUpdateKeys = async () => {
    setStatus({ type: 'info', message: 'Saving...' });
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/keys`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          gemini_api_key: geminiKey,
          cloudflare_api_token: cloudflareToken
        })
      });
      if (res.ok) {
        setStatus({ type: 'success', message: 'API Keys updated successfully!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        const err = await res.json();
        setStatus({ type: 'error', message: "Failed to update: " + err.error });
      }
    } catch (e) {
      setStatus({ type: 'error', message: "Error connecting to server." });
    }
  };

  const handleUpdateProfile = () => {
    setStatus({ type: 'info', message: 'Saving Profile...' });
    localStorage.setItem('businessName', businessName);
    localStorage.setItem('businessSubtitle', businessSubtitle);
    localStorage.setItem('ownerName', ownerName);
    localStorage.setItem('businessType', businessType);
    
    // Dispatch event to update App.jsx instantly
    window.dispatchEvent(new Event('profileUpdated'));
    
    setTimeout(() => {
      setStatus({ type: 'success', message: 'Business Profile updated successfully!' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }, 500);
  };

  return (
    <div>
      <h2 className="page-title">Setup & Settings</h2>
      <p className="page-subtitle mb-6">Manage your account and API configurations</p>

      {status.message && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? '#22c55e' : '#ef4444' }}>
          {status.message}
        </div>
      )}

      <div className="grid-2">
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <User size={20} color="var(--accent-primary)" />
            Business Profile
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Owner Name</label>
            <input 
              type="text" 
              className="input-glass" 
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Business Name</label>
            <input 
              type="text" 
              className="input-glass" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Subtitle / Slogan</label>
            <input 
              type="text" 
              className="input-glass" 
              value={businessSubtitle}
              onChange={(e) => setBusinessSubtitle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Business Type / Niche</label>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="e.g. DTF Printing, Shoes, Tech Gadgets"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>
          
          <button  
            className="btn btn-primary" 
            style={{ marginTop: '8px' }}
            onClick={handleUpdateProfile}
          >Save Profile</button>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Key size={20} color="var(--accent-primary)" />
            AI API Configurations
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Gemini API Key</label>
            <input 
              type="password" 
              className="input-glass" 
              placeholder="Leave blank to use system default" 
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Required for AI Content & Caption Generation</p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Cloudflare AI API Token</label>
            <input 
              type="password" 
              className="input-glass" 
              placeholder="Leave blank to use system default" 
              value={cloudflareToken}
              onChange={(e) => setCloudflareToken(e.target.value)}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Required for AI Image Generation</p>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '8px' }}
            onClick={handleUpdateKeys}
          >Save API Keys</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
