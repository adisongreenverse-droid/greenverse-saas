import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Download, Wand2, Loader, Upload, Sliders } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const MockupStudio = () => {
  const [prompt, setPrompt] = useState('A handsome model wearing a blank white t-shirt, standing on a New York street, photorealistic');
  const [artStyle, setArtStyle] = useState('Photorealistic, DSLR, 8k resolution, highly detailed');
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Logo Overlay State
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoScale, setLogoScale] = useState(0.25); // 25% of canvas width by default
  const [logoOffsetX, setLogoOffsetX] = useState(0);
  const [logoOffsetY, setLogoOffsetY] = useState(0);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const logoImageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
    
    // Create Image object for logo
    const img = new Image();
    img.onload = () => {
      logoImageRef.current = img;
      redrawCanvas();
    };
    img.src = url;
  };

  // Draw on canvas whenever images or settings change
  const redrawCanvas = () => {
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
  };

  useEffect(() => {
    redrawCanvas();
  }, [generatedImageUrl, logoUrl, logoScale, logoOffsetX, logoOffsetY]);

  const drawCanvas = (ctx, canvas, bgImg) => {
    // Set canvas dimensions to match background image
    canvas.width = bgImg.width || 800;
    canvas.height = bgImg.height || 800;
    
    // Draw background image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    
    // Draw Logo overlay if available
    if (logoImageRef.current) {
      const logo = logoImageRef.current;
      
      // Calculate target width and height based on scale slider (relative to canvas width)
      const targetWidth = canvas.width * logoScale;
      const aspectRatio = logo.height / logo.width;
      const targetHeight = targetWidth * aspectRatio;
      
      // Calculate centered X, Y then apply offsets
      // Slider offset is -100 to 100, we map it to pixels relative to canvas size
      const centerX = (canvas.width / 2) - (targetWidth / 2);
      const centerY = (canvas.height / 2) - (targetHeight / 2);
      
      const offsetXPixels = (logoOffsetX / 100) * (canvas.width / 2);
      const offsetYPixels = (logoOffsetY / 100) * (canvas.height / 2);
      
      const finalX = centerX + offsetXPixels;
      const finalY = centerY + offsetYPixels;
      
      // We don't want global composite operation that destroys background, just normal drawImage
      ctx.drawImage(logo, finalX, finalY, targetWidth, targetHeight);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const finalPrompt = artStyle ? `${prompt.trim()}, ${artStyle} style` : prompt.trim();

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
        imageRef.current = null; 
        setGeneratedImageUrl(data.image);
      } else {
        throw new Error(data.error || "Failed to generate AI Mockup.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate mockup. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl || !canvasRef.current) return;
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `GreenVerse_DTF_Mockup_${Date.now()}.jpg`;
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
      <h2 className="page-title">AI T-Shirt Mockup Studio</h2>
      <p className="page-subtitle mb-6">Generate an AI model wearing a blank T-shirt, and automatically overlay your DTF design!</p>
      
      <div className="grid-2">
        {/* Left Column: Generator Controls */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 'bold' }}>
              <Wand2 size={20} className="text-gradient" />
              Describe the Base Mockup Scene
            </label>
            <textarea 
              className="input-glass" 
              rows="3"
              placeholder="e.g. A handsome model wearing a blank white t-shirt, standing on a New York street..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ resize: 'vertical', width: '100%', fontSize: '15px' }}
            ></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Photography Style
            </label>
            <select 
              className="input-glass" 
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              style={{ width: '100%', padding: '12px' }}
            >
              <option value="Photorealistic, DSLR, 8k resolution, highly detailed">Photorealistic / Professional</option>
              <option value="Studio lighting, plain background, catalogue style">Studio / Clean Background</option>
              <option value="Cinematic lighting, dramatic, moody">Cinematic / Moody</option>
              <option value="Streetwear style, urban photography, raw">Streetwear / Urban</option>
              <option value="Vintage film camera, retro aesthetics, grainy">Vintage / Film</option>
            </select>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={16} /> DTF Design Overlay
            </h4>
            
            <input 
              type="file" 
              accept="image/png"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
            
            <button 
              className="btn btn-outline" 
              onClick={() => fileInputRef.current.click()}
              style={{ width: '100%', marginBottom: '16px', borderStyle: 'dashed' }}
            >
              {logoFile ? `Change Design (${logoFile.name})` : '+ Upload Transparent PNG Logo'}
            </button>

            {logoUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>Size (Scale)</span>
                    <span>{Math.round(logoScale * 100)}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0.05" max="0.8" step="0.01" 
                    value={logoScale} 
                    onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>Vertical Position (Y)</span>
                    <span>{logoOffsetY > 0 ? `+${logoOffsetY}` : logoOffsetY}</span>
                  </label>
                  <input 
                    type="range" 
                    min="-80" max="80" step="1" 
                    value={logoOffsetY} 
                    onChange={(e) => setLogoOffsetY(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>Horizontal Position (X)</span>
                    <span>{logoOffsetX > 0 ? `+${logoOffsetX}` : logoOffsetX}</span>
                  </label>
                  <input 
                    type="range" 
                    min="-80" max="80" step="1" 
                    value={logoOffsetX} 
                    onChange={(e) => setLogoOffsetX(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
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
                Generating Background... (Takes 5-10s)
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate T-Shirt Scene
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preview and Download */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon size={20} />
            Mockup Preview
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
                <p>Generating perfect AI mockup...</p>
              </div>
            ) : generatedImageUrl ? (
              <canvas 
                ref={canvasRef}
                style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'fadeIn 0.5s ease-out' }} 
              />
            ) : (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                <ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>Your AI T-Shirt Mockup will appear here.</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>First generate a scene, then upload your DTF design!</p>
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
              Download Final Mockup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockupStudio;
