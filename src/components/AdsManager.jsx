import React, { useState } from 'react';
import { DollarSign, Megaphone, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AdsManager = () => {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAd, setGeneratedAd] = useState(null);

  const handleGenerateAd = async () => {
    if (!product) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ads/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, audience })
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
      <h2 className="page-title">Ads & Budget Manager</h2>
      <p className="page-subtitle mb-6">Track your paid campaigns across Facebook and Instagram</p>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Spend (This Month)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₹4,500</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Budget: ₹10,000</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Cost Per Click (CPC)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }} className="text-gradient">₹2.45</div>
          <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '8px' }}>-0.50 from last week</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Conversions</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>128</div>
          <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '8px' }}>+15% from last week</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '24px' }}>Active Campaigns</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 0' }}>Campaign Name</th>
              <th>Status</th>
              <th>Spent</th>
              <th>Reach</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '16px 0', fontWeight: '500' }}>Summer DTF Offer</td>
              <td><span className="status-badge status-connected"><div className="status-dot"></div> Active</span></td>
              <td>₹1,200</td>
              <td>15.2K</td>
              <td><button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Pause</button></td>
            </tr>
            <tr>
              <td style={{ padding: '16px 0', fontWeight: '500' }}>AI Custom Outfits Promo</td>
              <td><span className="status-badge status-connected"><div className="status-dot"></div> Active</span></td>
              <td>₹3,300</td>
              <td>42.8K</td>
              <td><button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Pause</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-primary)' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✨ AI Ad Strategy Generator
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Let Gemini create high-converting ad copy and audience targeting for your DTF products.
        </p>

        <div className="grid-2">
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product Description</label>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="e.g. Neon Cyberpunk DTF Printed T-shirt"
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
              {isLoading ? 'Generating Strategy...' : 'Generate Ad Strategy'}
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
                Your AI-generated ad strategy will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsManager;
