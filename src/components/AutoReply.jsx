import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Save, Trash2, Edit2, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AutoReply = () => {
  const [rules, setRules] = useState([]);
  const [aiFallbackEnabled, setAiFallbackEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTrigger, setNewTrigger] = useState('');
  const [newReply, setNewReply] = useState('');
  const [newPlatform, setNewPlatform] = useState('Both');

  useEffect(() => {
    fetchRulesAndSettings();
  }, []);

  const fetchRulesAndSettings = async () => {
    try {
      const [rulesRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/autoreply/rules`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_BASE_URL}/api/autoreply/settings`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);
      
      const rulesData = await rulesRes.json();
      if (rulesData.success) {
        setRules(rulesData.rules);
      }
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.success) setAiFallbackEnabled(settingsData.aiFallbackEnabled);
      }
    } catch (err) {
      console.error('Error fetching auto-reply data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAiFallback = async () => {
    const newState = !aiFallbackEnabled;
    setAiFallbackEnabled(newState); // Optimistic UI update
    try {
      await fetch(`${API_BASE_URL}/api/autoreply/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ aiFallbackEnabled: newState })
      });
    } catch (err) {
      console.error('Error saving setting:', err);
    }
  };

  const handleAddRule = async () => {
    if (!newTrigger || !newReply) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/autoreply/rules`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ trigger: newTrigger, reply: newReply, platform: newPlatform })
      });
      const data = await res.json();
      if (data.success) {
        setRules([...rules, data.rule]);
        setIsAdding(false);
        setNewTrigger('');
        setNewReply('');
      }
    } catch (err) {
      console.error('Error adding rule:', err);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/autoreply/rules/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setRules(rules.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <Loader className="spin" size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        <p>Loading Auto-Reply Rules...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Auto-Reply Bot Manager</h2>
      <p className="page-subtitle mb-6">Configure instant replies for WhatsApp and Messenger</p>

      {/* AI Fallback Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.05))', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', marginBottom: '8px' }}>
            ✨ Smart AI Fallback
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
            If a customer's message doesn't match any of your rules below, let Gemini AI generate a smart, contextual reply based on your business profile automatically.
          </p>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
            <span style={{ fontWeight: '500', color: aiFallbackEnabled ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
              {aiFallbackEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <div 
              onClick={toggleAiFallback}
              style={{ 
                width: '50px', height: '26px', 
                borderRadius: '13px', 
                background: aiFallbackEnabled ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
                position: 'relative',
                transition: 'all 0.3s'
              }}
            >
              <div style={{
                position: 'absolute', top: '3px', left: aiFallbackEnabled ? '27px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: 'all 0.3s'
              }} />
            </div>
          </label>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3>Active Reply Rules</h3>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}><Plus size={16} /> Add Rule</button>
        </div>

        {isAdding && (
          <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px', border: '1px solid var(--accent-primary)' }}>
            <h4 style={{ margin: '0 0 16px 0' }}>Create New Rule</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', alignItems: 'start' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Trigger Keyword</label>
                <input type="text" className="input-field" placeholder="e.g. Price" value={newTrigger} onChange={e => setNewTrigger(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Bot Reply</label>
                <textarea className="input-field" rows="2" placeholder="e.g. It costs Rs 200" value={newReply} onChange={e => setNewReply(e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Platform</label>
                <select className="input-field" value={newPlatform} onChange={e => setNewPlatform(e.target.value)}>
                  <option>Both</option>
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>WhatsApp</option>
                </select>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn btn-primary" onClick={handleAddRule} style={{ flex: 1, padding: '8px' }}>Save</button>
                  <button className="btn btn-outline" onClick={() => setIsAdding(false)} style={{ flex: 1, padding: '8px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rules.length === 0 && !isAdding && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>No auto-reply rules configured yet.</p>
            </div>
          )}
          
          {rules.map(rule => (
            <div key={rule.id} className="glass-panel" style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>If user says:</div>
                <div style={{ fontWeight: '500', color: 'var(--accent-primary)' }}>"{rule.trigger}"</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Bot replies:</div>
                <div style={{ fontSize: '0.9rem' }}>{rule.reply}</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '12px' }}>{rule.platform}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" style={{ padding: '6px', borderRadius: '8px' }} title="Edit"><Edit2 size={14} /></button>
                  <button className="btn btn-outline" onClick={() => handleDeleteRule(rule.id)} style={{ padding: '6px', borderRadius: '8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoReply;
