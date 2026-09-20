import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download, Wand2, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const MockupStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [artStyle, setArtStyle] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Text Overlay State
  const [overlayText, setOverlayText] = useState('');
  const [overlayColor, setOverlayColor] = useState('#ffffff');
  const [overlayPosition, setOverlayPosition] = useState('bottom');
  
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);

  // Draw on canvas whenever text/image/settings change
  useEffect(() => {
    if (!generatedImageUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!imageRef.current) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        imageRef.current = img;
        drawCanvas(ctx, canvas, img);
      };
      img.src = generatedImageUrl;
    } else {
      drawCanvas(ctx, canvas, imageRef.current);
    }
  }, [generatedImageUrl, overlayText, overlayColor, overlayPosition]);

  const drawCanvas = (ctx, canvas, img) => {
    // Set canvas dimensions to match image natural size or a default large size
    canvas.width = img.width || 800;
    canvas.height = img.height || 800;
    
    // Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Draw text overlay if any
    if (overlayText.trim()) {
      ctx.fillStyle = overlayColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate font size based on canvas width (approx 8%)
      const fontSize = Math.floor(canvas.width * 0.08);
      ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
      
      // Add text shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      const x = canvas.width / 2;
      let y = canvas.height / 2;
      
      if (overlayPosition === 'top') {
        y = canvas.height * 0.15;
      } else if (overlayPosition === 'bottom') {
        y = canvas.height * 0.85;
      }
      
      // Support multiline text (very basic: split by newline if we want, but input is single line here)
      ctx.fillText(overlayText, x, y);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      // Append art style to prompt if selected
      const finalPrompt = artStyle ? `${prompt.trim()}, ${artStyle} style` : prompt.trim();

      // Use the Hugging Face /api/generate-image endpoint
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: finalPrompt })
      });
      
      const data = await response.json();
      
      if (data.success && data.image) {
        imageRef.current = null; // Reset cached image so canvas redraws
        setGeneratedImageUrl(data.image);
      } else {
        throw new Error(data.error || "Failed to generate image from AI.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl || !canvasRef.current) return;
    
    try {
      // Export canvas directly
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `GreenVerse_AI_Poster_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download image (possible CORS issue). You can right click the image and select "Save Image As".');
    }
  };

  return (
    <div>
      <h2 className="page-title">AI Image Studio</h2>
      <p className="page-subtitle mb-6">Type a prompt to instantly generate high-quality images and posters for your business.</p>
      
      <div className="grid-2">
        {/* Left Column: Generator Controls */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 'bold' }}>
              <Wand2 size={20} className="text-gradient" />
              What do you want to create?
            </label>
            <textarea 
              className="input-glass" 
              rows="4"
              placeholder="e.g. A stunning promotional poster for DTF Printing services, vibrant colors, professional lighting, photorealistic..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ resize: 'vertical', width: '100%', fontSize: '15px' }}
            ></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Art Style (Optional)
            </label>
            <select 
              className="input-glass" 
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              style={{ width: '100%', padding: '12px' }}
            >
              <option value="">None (Let AI decide)</option>
              <option value="Photorealistic, Highly Detailed, 8k, Unreal Engine 5">Photorealistic / 3D Render</option>
              <option value="Cyberpunk, Neon Lights, Futuristic, synthwave">Cyberpunk / Neon</option>
              <option value="Minimalist, clean background, modern flat design">Minimalist / Clean</option>
              <option value="Vintage, Retro, 90s aesthetic, grain">Vintage / Retro</option>
              <option value="Anime style, Studio Ghibli, vibrant colors, beautiful sky">Anime / Illustration</option>
            </select>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Text Overlay</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text"
                placeholder="Add text to your poster..."
                className="form-input"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Position</label>
                  <select 
                    className="form-input"
                    value={overlayPosition}
                    onChange={(e) => setOverlayPosition(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', padding: '8px' }}
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Color</label>
                  <input 
                    type="color"
                    value={overlayColor}
                    onChange={(e) => setOverlayColor(e.target.value)}
                    style={{ width: '50px', height: '36px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{ padding: '16px', fontSize: '16px', width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {isGenerating ? (
              <>
                <Loader size={20} className="animate-spin" />
                Generating Image... (Takes 5-10s)
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate AI Image
              </>
            )}
          </button>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginTop: 'auto', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 Tips for best results</h4>
            <ul style={{ fontSize: '13px', color: '#ccc', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Be specific about colors and lighting.</li>
              <li>Mention "4k" or "photorealistic" for high quality.</li>
              <li>Keep trying different prompts until you get the perfect shot!</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Preview and Download */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon size={20} />
            AI Output
          </h3>
          
          <div style={{ 
            flex: 1, 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '12px',
            border: '2px dashed rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {isGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent-primary)' }}>
                <Loader size={48} className="animate-spin" style={{ marginBottom: '16px' }} />
                <p>Painting your imagination...</p>
              </div>
            ) : generatedImageUrl ? (
              <canvas 
                ref={canvasRef}
                style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'fadeIn 0.5s ease-out' }} 
              />
            ) : (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                <ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>Your generated image will appear here.</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button 
              className="btn btn-outline" 
              onClick={handleDownload}
              disabled={!generatedImageUrl || isGenerating}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Download size={18} />
              Download Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockupStudio;
