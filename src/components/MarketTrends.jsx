import React, { useState, useEffect } from 'react';
import { TrendingUp, Hash, Zap, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const MarketTrends = () => {
  const [trends, setTrends] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [niche, setNiche] = useState(localStorage.getItem('businessType') || 'DTF Printing');

  useEffect(() => {
    const handleProfileUpdate = () => {
      setNiche(localStorage.getItem('businessType') || 'DTF Printing');
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/market/trends?niche=${encodeURIComponent(niche)}`);
        const result = await res.json();
        if (result.success) {
          setTrends(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch trends", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, [niche]);

  return (
    <div>
      <h2 className="page-title">Market Trends & AI Analysis</h2>
      <p className="page-subtitle mb-6">Discover what's trending in {niche}</p>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader className="animate-spin" size={32} color="var(--accent-primary)" />
        </div>
      ) : !trends ? (
        <p>Failed to load AI Trends. Please check your API key.</p>
      ) : (
        <div className="grid-3">
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={20} color="var(--accent-primary)" />
              Top Trending Designs
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trends.topDesigns.map((design, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{i+1}. {design.name}</span> 
                  <span className={design.status === 'Hot' ? 'text-gradient' : (design.status === 'Rising' ? 'text-gradient' : '')} style={{ color: design.status === 'Stable' ? 'var(--text-secondary)' : undefined }}>
                    {design.status === 'Hot' ? '🔥 Hot' : design.status === 'Rising' ? '↑ Rising' : 'Stable'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Hash size={20} color="var(--accent-primary)" />
              Viral Hashtags
            </h3>
            <div className="tag-container">
              {trends.viralHashtags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={20} color="var(--accent-primary)" />
              AI Suggestion
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              "{trends.aiSuggestion}"
            </p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => {
                navigator.clipboard.writeText(trends.aiSuggestion);
                alert("Copied to clipboard! Go to AI Campaign Manager to use it.");
              }}
            >
              Use this Suggestion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTrends;
