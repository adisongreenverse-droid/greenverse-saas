import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MapPin, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { API_BASE_URL } from '../config/api';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const [activeTab, setActiveTab] = useState('facebook');
  const [dateRange, setDateRange] = useState('7d');
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics?range=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
          setIsMock(result.mock);
        } else {
          setError(result.error || 'Failed to fetch analytics data');
        }
      } catch (err) {
        setError('Network error while fetching analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <Loader className="spin" size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        <p>Loading Analytics Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#ef4444' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
        <h3>Data Unavailable</h3>
        <p>{error}</p>
      </div>
    );
  }

  const currentData = data ? data[activeTab] : null;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="page-title">Analytics & Insights</h2>
          <p className="page-subtitle">Detailed performance of your DTF printing business</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isMock && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 16px', borderRadius: '20px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> <span>Showing Demo Data (Connect FB to see real stats)</span>
            </div>
          )}
          <select 
            className="input-glass" 
            style={{ width: 'auto', padding: '8px 16px' }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Platform Comparison Bar Chart */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <BarChart3 size={20} color="var(--accent-primary)" />
          Platform Comparison (Total Reach)
        </h3>
        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={[
                { name: 'Facebook', reach: data?.facebook?.reach?.total || 0, fill: 'var(--accent-primary)' },
                { name: 'Instagram', reach: data?.instagram?.reach?.total || 0, fill: '#e1306c' },
                { name: 'WhatsApp', reach: data?.whatsapp?.reach?.total || 0, fill: '#25d366' }
              ]} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="reach" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('facebook')}
          style={{ padding: '8px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', background: activeTab === 'facebook' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', color: activeTab === 'facebook' ? '#fff' : 'var(--text-secondary)' }}
        >
          Facebook
        </button>
        <button 
          onClick={() => setActiveTab('instagram')}
          style={{ padding: '8px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', background: activeTab === 'instagram' ? '#e1306c' : 'rgba(255,255,255,0.05)', color: activeTab === 'instagram' ? '#fff' : 'var(--text-secondary)' }}
        >
          Instagram
        </button>
        <button 
          onClick={() => setActiveTab('whatsapp')}
          style={{ padding: '8px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', background: activeTab === 'whatsapp' ? '#25d366' : 'rgba(255,255,255,0.05)', color: activeTab === 'whatsapp' ? '#fff' : 'var(--text-secondary)' }}
        >
          WhatsApp
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px' }}>
              <Users size={24} color="var(--accent-primary)" />
            </div>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: '500' }}>
              <TrendingUp size={16} /> {currentData?.reach?.trend}
            </span>
          </div>
          <h3 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>{currentData?.reach?.total?.toLocaleString()}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{activeTab === 'whatsapp' ? 'Total Messages Sent' : 'Total Reach'}</p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px' }}>
              <BarChart3 size={24} color="var(--accent-primary)" />
            </div>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: '500' }}>
              <TrendingUp size={16} /> {currentData?.engagement?.trend}
            </span>
          </div>
          <h3 style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>{currentData?.engagement?.rate}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{activeTab === 'whatsapp' ? 'Delivery Rate' : 'Engagement Rate'}</p>
        </div>
        
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px' }}>
              <MapPin size={24} color="var(--accent-primary)" />
            </div>
          </div>
          <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentData?.audience?.locations[0]?.name || 'N/A'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Top Location</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <BarChart3 size={20} color="var(--accent-primary)" />
            Weekly {activeTab === 'whatsapp' ? 'Activity' : 'Reach'}
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData?.reach?.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeTab === 'instagram' ? '#e1306c' : activeTab === 'whatsapp' ? '#25d366' : 'var(--accent-primary)'} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={activeTab === 'instagram' ? '#e1306c' : activeTab === 'whatsapp' ? '#25d366' : 'var(--accent-primary)'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: activeTab === 'instagram' ? '#e1306c' : activeTab === 'whatsapp' ? '#25d366' : 'var(--accent-primary)' }}
                />
                <Area type="monotone" dataKey="value" stroke={activeTab === 'instagram' ? '#e1306c' : activeTab === 'whatsapp' ? '#25d366' : 'var(--accent-primary)'} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Users size={20} color="var(--accent-primary)" />
            Audience Demographics
          </h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {currentData?.audience?.demographics.map((demo, idx) => (
              <div key={idx} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '500' }}>{activeTab === 'whatsapp' ? '' : 'Age '}{demo.group}</span>
                  <span className="text-gradient" style={{ fontWeight: 'bold' }}>{demo.percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${demo.percentage}%`, 
                      height: '100%', 
                      background: activeTab === 'instagram' ? 'linear-gradient(90deg, #fd1d1d, #fcb045)' : activeTab === 'whatsapp' ? 'linear-gradient(90deg, #128C7E, #25D366)' : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', 
                      borderRadius: '5px',
                      transition: 'width 1s ease-out'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-secondary)' }}>Top Locations</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {currentData?.audience?.locations.slice(0, 3).map((loc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.875rem' }}>
                  <MapPin size={14} color={activeTab === 'instagram' ? '#e1306c' : activeTab === 'whatsapp' ? '#25d366' : 'var(--accent-secondary)'} /> 
                  <span>{loc.name}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '4px' }}>({loc.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
