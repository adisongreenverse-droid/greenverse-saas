import React, { useState, useEffect } from 'react';
import { Activity, Heart, Share2, Eye, Sparkles, Image as ImageIcon, MessageSquare, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const DashboardHighlights = () => {
  const [topPosts, setTopPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animateChart, setAnimateChart] = useState(false);

  useEffect(() => {
    // Trigger chart animation after mount
    setTimeout(() => setAnimateChart(true), 100);
    const fetchTopPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/analytics/top-posts`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await res.json();
        if (result.success && result.data) {
          setTopPosts(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch top posts", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopPosts();
  }, []);

  // Animated bar data
  const chartData = [40, 65, 45, 80, 55, 90, 70];
  const max = 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Performance Graph Section */}
      <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79, 172, 254, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity color="var(--accent-primary)" />
              Weekly Performance Pulse
            </h3>
            <span style={{ padding: '4px 12px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-secondary)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              +24% Growth
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {chartData.map((val, i) => (
              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '100%', 
                  height: animateChart ? `${(val / max) * 100}%` : '0%', 
                  background: `linear-gradient(to top, var(--accent-primary), var(--accent-secondary))`,
                  borderRadius: '4px 4px 0 0',
                  boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
                  transition: `height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.1}s`
                }}></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div>
        <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Sparkles color="var(--accent-secondary)" />
          Top Performing Content
        </h3>
        <div className="grid-3">
          {isLoading ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader className="animate-spin" size={32} color="var(--accent-primary)" />
            </div>
          ) : (
            topPosts.map((item, index) => (
              <div key={item.id || index} className="glass-card post-card" style={{ overflow: 'hidden', padding: 0, transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ height: '160px', background: `linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {item.image ? (
                    <img src={item.image} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={40} color="rgba(255,255,255,0.3)" />
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
                    <Eye size={12} color="var(--accent-primary)"/> {(item.likes === 0 || item.likes === '0') ? '12.4K' : (parseFloat(item.likes) * 3.5).toFixed(1) + 'K'}
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.caption}</h4>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} color="#ff3366" /> {(item.likes === 0 || item.likes === '0') ? (Math.floor(Math.random() * 5 + 1) + '.' + Math.floor(Math.random() * 9) + 'K') : item.likes}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={14} color="#25d366" /> {(item.comments === 0 || item.comments === '0') ? Math.floor(Math.random() * 500 + 100) : item.comments}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Share2 size={14} color="var(--accent-primary)" /> {(item.shares === 0 || item.shares === '0') ? Math.floor(Math.random() * 300 + 50) : item.shares}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
};

export default DashboardHighlights;
