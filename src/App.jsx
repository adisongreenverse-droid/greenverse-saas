import React, { useState, useEffect } from 'react'
import ConnectCards from './components/ConnectCards'
import Login from './components/Login'
import SmartCalendar from './components/SmartCalendar'
import AICampaign from './components/AICampaign'
import PostCreator from './components/PostCreator'
import Analytics from './components/Analytics'
import AutoReply from './components/AutoReply'
import MarketTrends from './components/MarketTrends'
import AdsManager from './components/AdsManager'
import Settings from './components/Settings'
import MockupStudio from './components/MockupStudio'
import DashboardHighlights from './components/DashboardHighlights'
import { LayoutDashboard, Calendar, Sparkles, PenTool, Link2, BarChart3, Bot, TrendingUp, DollarSign, Settings as SettingsIcon, Image as ImageIcon } from 'lucide-react'
import { API_BASE_URL } from './config/api'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardPlatform, setDashboardPlatform] = useState('facebook')
  const [fullAnalyticsData, setFullAnalyticsData] = useState(null)
  
  const [profile, setProfile] = useState({
    businessName: localStorage.getItem('businessName') || 'Greenverse',
    businessSubtitle: localStorage.getItem('businessSubtitle') || 'Adison DTF',
    ownerName: localStorage.getItem('ownerName') || 'Adison'
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfile({
        businessName: localStorage.getItem('businessName') || 'Greenverse',
        businessSubtitle: localStorage.getItem('businessSubtitle') || 'Adison DTF',
        ownerName: localStorage.getItem('ownerName') || 'Adison'
      });
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      fetchDashboardData(token)
    }
  }, [])

  const fetchDashboardData = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics?range=7d`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success && result.data) {
        setFullAnalyticsData(result.data);
        setDashboardData(result.data.facebook);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  }

  useEffect(() => {
    if (fullAnalyticsData && fullAnalyticsData[dashboardPlatform]) {
      setDashboardData(fullAnalyticsData[dashboardPlatform]);
    }
  }, [dashboardPlatform, fullAnalyticsData]);

  const handleLogin = (token) => {
    setIsAuthenticated(true)
    fetchDashboardData(token)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'connections':
        return <ConnectCards />
      case 'calendar':
        return <SmartCalendar />
      case 'campaign':
        return <AICampaign />
      case 'post':
        return <PostCreator />
      case 'analytics':
        return <Analytics />
      case 'autoreply':
        return <AutoReply />
      case 'trends':
        return <MarketTrends />
      case 'mockup':
        return <MockupStudio />
      case 'ads':
        return <AdsManager />
      case 'settings':
        return <Settings />
      default:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="page-title">Welcome back, {profile.ownerName}!</h2>
                <p className="page-subtitle mb-6">Here's your social media overview</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '24px' }}>
                <button 
                  onClick={() => setDashboardPlatform('facebook')}
                  style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', background: dashboardPlatform === 'facebook' ? 'var(--accent-primary)' : 'transparent', color: dashboardPlatform === 'facebook' ? '#fff' : 'var(--text-secondary)' }}
                >
                  Facebook
                </button>
                <button 
                  onClick={() => setDashboardPlatform('instagram')}
                  style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', background: dashboardPlatform === 'instagram' ? '#e1306c' : 'transparent', color: dashboardPlatform === 'instagram' ? '#fff' : 'var(--text-secondary)' }}
                >
                  Instagram
                </button>
                <button 
                  onClick={() => setDashboardPlatform('whatsapp')}
                  style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', background: dashboardPlatform === 'whatsapp' ? '#25d366' : 'transparent', color: dashboardPlatform === 'whatsapp' ? '#fff' : 'var(--text-secondary)' }}
                >
                  WhatsApp
                </button>
              </div>
            </div>
            
            <div className="grid-3" style={{ marginTop: '24px', marginBottom: '32px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'capitalize' }}>Total Reach ({dashboardPlatform})</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }} className="text-gradient">
                  {dashboardData ? dashboardData.reach.total.toLocaleString() : '24.5K'}
                </div>
                <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '8px' }}>
                  <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }}/>
                  {dashboardData ? dashboardData.reach.trend : '+12% from last week'}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{dashboardPlatform === 'whatsapp' ? 'Delivery Rate' : 'Engagement Rate'}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }} className="text-gradient">
                  {dashboardData ? dashboardData.engagement.rate : '8.2%'}
                </div>
                <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '8px' }}>
                  <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }}/>
                  {dashboardData ? dashboardData.engagement.trend : '+2.1% from last week'}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'capitalize' }}>Total Followers ({dashboardPlatform})</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }} className="text-gradient">
                  {dashboardData && dashboardData.followers ? dashboardData.followers.toLocaleString() : '5,200'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
                  Audience Base
                </div>
              </div>
            </div>
            
            <DashboardHighlights />
          </div>
        )
    }
  }

  return (
    <div className="app-container">
      <aside className="sidebar" style={{ overflowY: 'auto' }}>
        <div className="logo-area" style={{ marginBottom: '16px' }}>
          <div className="logo-icon">{profile.businessName.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{profile.businessName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{profile.businessSubtitle}</div>
          </div>
        </div>
        
        <nav className="nav-menu">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px', marginTop: '8px' }}>Core</div>
          <a className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a className={`nav-item ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>
            <Link2 size={20} /> Connections
          </a>
          <a className={`nav-item ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}>
            <PenTool size={20} /> Create Post
          </a>
          <a className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <Calendar size={20} /> Smart Calendar
          </a>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px', marginTop: '16px' }}>AI & Marketing</div>
          <a className={`nav-item ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => setActiveTab('campaign')}>
            <Sparkles size={20} /> AI Campaign
          </a>
          <a className={`nav-item ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>
            <TrendingUp size={20} /> Market Trends
          </a>
          <a className={`nav-item ${activeTab === 'mockup' ? 'active' : ''}`} onClick={() => setActiveTab('mockup')}>
            <ImageIcon size={20} /> Mockup Studio
          </a>
          <a className={`nav-item ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
            <DollarSign size={20} /> Ads Manager
          </a>
          <a className={`nav-item ${activeTab === 'autoreply' ? 'active' : ''}`} onClick={() => setActiveTab('autoreply')}>
            <Bot size={20} /> Auto-Reply Bot
          </a>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', padding: '8px 16px', marginTop: '16px' }}>Reports & Config</div>
          <a className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={20} /> Analytics
          </a>
          <a className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <SettingsIcon size={20} /> Setup & Settings
          </a>
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <a className="nav-item" onClick={handleLogout} style={{ color: '#ff4d4f' }}>
              Logout
            </a>
          </div>
        </nav>
      </aside>
      
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
