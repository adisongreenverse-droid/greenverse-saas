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
  
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

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
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/invites`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setInvites(data.invites || []);
      }
    } catch (e) {
      console.error("Failed to fetch invites", e);
    }
  };

  const handleGenerateInvite = async () => {
    setLoadingInvites(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/invites`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchInvites(); // Refresh list
        setStatus({ type: 'success', message: `New Invite Code Generated: ${data.invite.code}` });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to generate code (Admin only)' });
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'Error connecting to server' });
    } finally {
      setLoadingInvites(false);
    }
  };

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

      <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Shield size={20} color="var(--accent-primary)" />
          Invite Code Generator (Admin)
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Generate unique, one-time-use access codes for new customers. They must enter this code during Sign Up.
        </p>

        <button 
          className="btn btn-primary" 
          style={{ marginBottom: '24px' }}
          onClick={handleGenerateInvite}
          disabled={loadingInvites}
        >
          {loadingInvites ? 'Generating...' : '+ Generate New Invite Code'}
        </button>

        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Invite Code</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Used By</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>No invite codes generated yet.</td>
                </tr>
              ) : (
                invites.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 'bold' }}>{inv.code}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {inv.is_used ? (
                        <span style={{ color: '#ef4444', fontSize: '12px', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Used</span>
                      ) : (
                        <span style={{ color: '#22c55e', fontSize: '12px', background: 'rgba(34,197,94,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Available</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{inv.users ? inv.users.email : '-'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
