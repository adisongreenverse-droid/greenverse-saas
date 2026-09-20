import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Hash, Send, Video } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AICampaign = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [reelScript, setReelScript] = useState(null);

  const [style, setStyle] = useState('');
  const [goal, setGoal] = useState('Brand Awareness');
  const [imageFile, setImageFile] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    setReelScript(null);
    try {
      let body, headers = {};
      if (imageFile) {
        body = new FormData();
        body.append('style', style);
        body.append('goal', goal);
        body.append('image', imageFile);
      } else {
        body = JSON.stringify({ style, goal });
        headers = { 'Content-Type': 'application/json' };
      }

      const res = await fetch(`${API_BASE_URL}/api/campaign/generate`, {
        method: 'POST',
        headers,
        body
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert('Failed to generate campaign: ' + data.error);
      }
    } catch (err) {
      alert('Error connecting to AI Server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReel = async () => {
    setIsGenerating(true);
    setResult(null);
    setReelScript(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/campaign/reel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, goal })
      });
      const data = await res.json();
      if (data.success) {
        setReelScript(data.data);
      } else {
        alert('Failed to generate reel script: ' + data.error);
      }
    } catch (err) {
      alert('Error connecting to AI Server.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">AI Campaign Manager</h2>
      <p className="page-subtitle mb-6">Generate outfits, content, hashtags, and Reel scripts with your AI model</p>
      
      <div className="grid-2" style={{ marginTop: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            AI Generator Settings
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Model Selection (Upload your AI Girl)</label>
            <input 
              type="file" 
              accept="image/*" 
              className="input-glass" 
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ display: 'block', width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Outfit / Post Style</label>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="e.g. Cyberpunk street fashion, casual summer..." 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Campaign Goal</label>
            <select className="input-glass" value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option>Brand Awareness</option>
              <option>Product Sale</option>
              <option>Engagement</option>
              <option>Viral Reach</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={isGenerating} style={{ flex: 1 }}>
              {isGenerating && !reelScript && !result ? 'Generating...' : 'Generate Campaign Image'}
            </button>
            <button className="btn btn-outline" onClick={handleGenerateReel} disabled={isGenerating} style={{ flex: 1, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
              <Video size={16} style={{ marginRight: '8px', display: 'inline' }} />
              {isGenerating && !reelScript && !result ? 'Writing Script...' : 'Generate Reel Script'}
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Preview & Result</h3>
          
          {!result && !reelScript && !isGenerating && (
            <div className="ai-preview-area">
              <ImageIcon className="upload-icon" />
              <p>Your generated content will appear here</p>
            </div>
          )}
          
          {isGenerating && (
            <div className="ai-preview-area">
              <div className="status-dot" style={{ width: '20px', height: '20px', animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
              <p style={{ marginTop: '16px' }}>AI is thinking...</p>
            </div>
          )}
          
          {result && (
            <div>
              <img 
                src={imageFile ? URL.createObjectURL(imageFile) : result.img} 
                alt="Generated" 
                style={{ width: '100%', borderRadius: '8px', marginBottom: '16px', maxHeight: '400px', objectFit: 'contain' }} 
              />
              <div className="input-glass" style={{ marginBottom: '16px', minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                {result.content}
              </div>
              <div className="tag-container" style={{ marginBottom: '24px' }}>
                {result.hashtags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => {
                    navigator.clipboard.writeText(result.content + '\n\n' + result.hashtags.join(' '));
                    alert('Campaign text copied to clipboard!');
                  }}
                >
                  <Send size={16} /> Copy to Post Creator
                </button>
              </div>
            </div>
          )}

          {reelScript && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '500px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>🎣 The Hook (0-3s)</h4>
                <p style={{ fontSize: '0.9rem' }}>{reelScript.hook}</p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f39c12' }}>
                <h4 style={{ color: '#f39c12', marginBottom: '8px' }}>🎵 Trending Audio</h4>
                <p style={{ fontSize: '0.9rem' }}>{reelScript.audio}</p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
                <h4 style={{ color: '#3498db', marginBottom: '8px' }}>🎥 Visuals & Camera</h4>
                <p style={{ fontSize: '0.9rem' }}>{reelScript.visuals}</p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #e74c3c' }}>
                <h4 style={{ color: '#e74c3c', marginBottom: '8px' }}>💬 Text On Screen</h4>
                <p style={{ fontSize: '0.9rem' }}>{reelScript.textOnScreen}</p>
              </div>

              <div className="input-glass" style={{ minHeight: '80px', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                <strong>Caption:</strong><br/>
                {reelScript.caption}
              </div>

              <button 
                className="btn btn-primary" 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(reelScript, null, 2));
                  alert('Reel Script copied to clipboard!');
                }}
              >
                Copy Full Script
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICampaign;
