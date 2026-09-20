import React, { useState, useEffect } from 'react';
import { DollarSign, Megaphone, Activity, Settings, Save, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AdsManager = () => {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAd, setGeneratedAd] = useState(null);
  
  // Dynamic Settings
  const [showSettings, setShowSettings] = useState(false);
  const [businessProfile, setBusinessProfile] = useState('');
  const [adAccountId, setAdAccountId] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Real Metrics Data
  const [metrics, setMetrics] = useState({
    spend: '₹0',
    cpc: '₹0.00',
    conversions: 0,
    campaigns: []
  });
  const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/ad_settings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setBusinessProfile(data.settings.business_profile || '');
        setAdAccountId(data.settings.ad_account_id || '');
        // Once settings are loaded, fetch metrics
        if (data.settings.ad_account_id) {
          fetchMetrics();
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/ad_settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ business_profile: businessProfile, ad_account_id: adAccountId })
      });
      const data = await response.json();
      if (data.success) {
        alert("Settings saved successfully!");
        setShowSettings(false);
        fetchMetrics(); // Refresh data with new account
      } else {
        alert("Error saving settings");
      }
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchMetrics = async () => {
    setIsFetchingMetrics(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ads/metrics`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to fetch ad metrics:", err);
    } finally {
      setIsFetchingMetrics(false);
    }
  };

  const handleGenerateAd = async () => {
    if (!product) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ads/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ product, audience, businessProfile })
      });
      const data = await response.json();
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        setGeneratedAd(data);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate ad strategy.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Ads & Budget Manager</h2>
          <p className="page-subtitle mb-6">Track your paid campaigns across Facebook and Instagram</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={fetchMetrics} disabled={isFetchingMetrics}>
            <RefreshCw size={16} className={isFetchingMetrics ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={16} /> Ad Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--accent-primary)' }}>
          <h3 style={{ marginBottom: '16px' }}>⚙️ Multi-Tenant Ad Configuration</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Setup your specific Business Profile and Facebook Ad Account ID here. The AI will use your profile to generate relevant ads, and the metrics will be fetched securely for your account only.
          </p>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Your Business Profile (What do you sell?)</label>
              <textarea 
                className="input-glass"
                rows="3"
                placeholder="e.g. We are a DTF printing service in Mumbai offering custom t-shirts."
                value={businessProfile}
                onChange={(e) => setBusinessProfile(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Facebook Ad Account ID</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="e.g. 1234567890123"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                style={{ width: '100%', marginBottom: '16px' }}
              />
              <button className="btn btn-primary" onClick={saveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? 'Saving...' : <><Save size={16}/> Save Settings</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Spend (This Month)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{metrics.spend}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Live Facebook Data</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Cost Per Click (CPC)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }} className="text-gradient">{metrics.cpc}</div>
          <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '8px' }}>Avg. Performance</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Conversions / Leads</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{metrics.conversions}</div>
          <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '8px' }}>Across Campaigns</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '24px' }}>Active Campaigns</h3>
        
        {metrics.campaigns.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No active campaigns found. Make sure your Ad Account ID is configured and you have active ads running.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 0' }}>Campaign Name</th>
                <th>Status</th>
                <th>Spent</th>
                <th>Impressions</th>
              </tr>
            </thead>
            <tbody>
              {metrics.campaigns.map((camp, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 0', fontWeight: '500' }}>{camp.name}</td>
                  <td>
                    <span className={`status-badge ${camp.status === 'ACTIVE' ? 'status-connected' : 'status-disconnected'}`}>
                      <div className="status-dot"></div> {camp.status}
                    </span>
                  </td>
                  <td>{camp.spend}</td>
                  <td>{camp.impressions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-primary)' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✨ AI Ad Strategy Generator
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Let Gemini create high-converting ad copy and audience targeting specifically tailored to your configured Business Profile.
        </p>

        <div className="grid-2">
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product / Offer Description</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="e.g. Neon Cyberpunk T-shirt (Buy 1 Get 1)"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Target Audience (Optional)</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="e.g. College students in Delhi"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleGenerateAd}
              disabled={isLoading || !product}
              style={{ width: '100%' }}
            >
              {isLoading ? 'Generating Strategy...' : 'Generate AI Ad Strategy'}
            </button>
          </div>

          <div>
            {generatedAd ? (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', height: '100%', overflowY: 'auto' }}>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>🎯 Target Audience</h4>
                <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  <strong>Age:</strong> {generatedAd.targetAudience.age} <br/>
                  <strong>Interests:</strong> {generatedAd.targetAudience.interests} <br/>
                  <strong>Locations:</strong> {generatedAd.targetAudience.locations}
                </div>

                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>✍️ Ad Copy</h4>
                <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  <strong>Headline:</strong> {generatedAd.adCopy.headline} <br/><br/>
                  <strong>Text:</strong> {generatedAd.adCopy.primaryText} <br/><br/>
                  <strong>CTA:</strong> {generatedAd.adCopy.callToAction}
                </div>

                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>💰 Budget Recommendation</h4>
                <div style={{ fontSize: '0.9rem', color: 'var(--success)' }}>
                  {generatedAd.budgetRecommendation}
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-glass)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                Your Custom AI-generated ad strategy will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsManager;
