import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Loader, Crop, Type, Image as ImageIcon, Film, Maximize, Tag, Hash, Link, AlignLeft, Wand2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const PostCreator = () => {
  const [postType, setPostType] = useState('image'); // 'text', 'image', 'video'
  const [platforms, setPlatforms] = useState({
    facebook: true,
    instagram: true,
    whatsapp: false,
    google: false
  });
  
  const [caption, setCaption] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [cta, setCta] = useState('');
  const [whatsappRecipients, setWhatsappRecipients] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '', isLoading: false });
  const fileInputRef = useRef(null);

  // Scheduling State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [businessType, setBusinessType] = useState(localStorage.getItem('businessType') || 'DTF Printing');

  useEffect(() => {
    const handleProfileUpdate = () => {
      setBusinessType(localStorage.getItem('businessType') || 'DTF Printing');
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setStatus({ type: 'error', message: 'Please enter a prompt to generate an image.' });
      return;
    }
    
    setIsGeneratingImage(true);
    setStatus({ type: 'info', message: 'AI is generating your image. This might take up to 30 seconds...', isLoading: true });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: imagePrompt })
      });
      const data = await response.json();
      
      if (data.success) {
        const res2 = await fetch(data.image);
        const blob = await res2.blob();
        const file = new File([blob], "ai_generated.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreviewUrl(data.image);
        setPostType('image');
        setStatus({ type: 'success', message: 'AI Image generated successfully!', isLoading: false });
        setTimeout(() => setStatus({ type: '', message: '', isLoading: false }), 4000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to generate image.', isLoading: false });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Could not connect to AI service.', isLoading: false });
    }
    
    setIsGeneratingImage(false);
  };

  const handleAIGenerate = async () => {
    if (!selectedFile && postType !== 'text') {
      setStatus({ type: 'error', message: 'Please upload an image first for AI generation context.' });
      return;
    }

    setIsGenerating(true);
    setStatus({ type: 'info', message: 'AI is analyzing your image and generating a catchy caption...', isLoading: true });
    
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/generate`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        setCaption(data.caption);
        setHashtags(data.hashtags);
        setStatus({ type: 'success', message: 'AI analyzed the image and generated content successfully!', isLoading: false });
        
        // Hide success message after 4 seconds
        setTimeout(() => setStatus({ type: '', message: '', isLoading: false }), 4000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to generate AI content.', isLoading: false });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Could not connect to AI service.', isLoading: false });
    }
    
    setIsGenerating(false);
  };

  const togglePlatform = (platform) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAutoCrop = () => {
    if (!previewUrl || !selectedFile || postType !== 'image') return;
    
    setStatus({ type: 'info', message: 'Cropping image to 1:1...', isLoading: true });
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;
      
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          setStatus({ type: 'error', message: 'Crop failed.', isLoading: false });
          return;
        }
        
        const ext = selectedFile.name.split('.').pop() || 'jpg';
        const newFile = new File([blob], `cropped_1x1.${ext}`, { type: blob.type });
        
        setSelectedFile(newFile);
        setPreviewUrl(URL.createObjectURL(newFile));
        setStatus({ type: 'success', message: 'Image successfully cropped to 1:1 ratio.', isLoading: false });
      }, selectedFile.type, 1.0);
    };
    
    img.onerror = () => {
      setStatus({ type: 'error', message: 'Could not load image for cropping.', isLoading: false });
    };
    
    img.src = previewUrl;
  };

  const handleAutoFit = () => {
    if (!previewUrl || !selectedFile || postType !== 'image') return;
    
    setStatus({ type: 'info', message: 'Fitting image to 1:1...', isLoading: true });
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = Math.max(img.width, img.height);
      
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      
      // Draw centered
      const startX = (size - img.width) / 2;
      const startY = (size - img.height) / 2;
      ctx.drawImage(img, startX, startY, img.width, img.height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          setStatus({ type: 'error', message: 'Fit failed.', isLoading: false });
          return;
        }
        
        const newFile = new File([blob], `fitted_1x1.jpg`, { type: 'image/jpeg' });
        
        setSelectedFile(newFile);
        setPreviewUrl(URL.createObjectURL(newFile));
        setStatus({ type: 'success', message: 'Image successfully fitted to 1:1 with borders to prevent cropping.', isLoading: false });
      }, 'image/jpeg', 0.95);
    };
    
    img.onerror = () => {
      setStatus({ type: 'error', message: 'Could not load image for fitting.', isLoading: false });
    };
    
    img.src = previewUrl;
  };

  const handlePost = async () => {
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    if (selectedPlatforms.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one platform to post to.' });
      return;
    }

    if (postType === 'text' && platforms.instagram) {
      setStatus({ type: 'error', message: 'Instagram requires an Image or Video. It does not support Text-only posts.' });
      return;
    }

    if (platforms.whatsapp && !whatsappRecipients.trim()) {
      setStatus({ type: 'error', message: 'Please enter at least one WhatsApp number.' });
      return;
    }

    if (postType !== 'text' && !selectedFile) {
      setStatus({ type: 'error', message: `Please upload an ${postType === 'video' ? 'video' : 'image'} first.` });
      return;
    }

    if (postType === 'text' && !caption.trim()) {
      setStatus({ type: 'error', message: 'Please write a caption for your text post.' });
      return;
    }

    let unixTimestamp = null;
    if (isScheduled) {
      if (!scheduleTime) {
        setStatus({ type: 'error', message: 'Please select a date and time for scheduling.' });
        return;
      }
      
      const scheduledDate = new Date(scheduleTime);
      const now = new Date();
      unixTimestamp = Math.floor(scheduledDate.getTime() / 1000);
      const nowUnix = Math.floor(now.getTime() / 1000);
      
      if (unixTimestamp < nowUnix + 600) {
        setStatus({ type: 'error', message: 'Schedule time must be at least 10 minutes in the future.' });
        return;
      }
      if (unixTimestamp > nowUnix + (75 * 24 * 60 * 60)) {
        setStatus({ type: 'error', message: 'Schedule time cannot be more than 75 days in the future.' });
        return;
      }
    }

    setStatus({ type: 'info', message: isScheduled ? 'Scheduling...' : 'Publishing...', isLoading: true });

    const formData = new FormData();
    if (selectedFile && postType !== 'text') {
      formData.append(postType === 'video' ? 'video' : 'image', selectedFile);
    }
    formData.append('message', caption);
    formData.append('postTitle', postTitle);
    formData.append('hashtags', hashtags);
    formData.append('cta', cta);
    formData.append('postType', postType);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    
    if (platforms.whatsapp) {
      formData.append('whatsappRecipients', whatsappRecipients);
    }

    if (isScheduled && unixTimestamp) {
      formData.append('scheduled_publish_time', unixTimestamp);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/post/social`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        let msg = '';
        if (result.results) {
          const successes = [];
          const failures = [];
          
          if (result.results.facebook) {
            result.results.facebook.forEach(r => r.success ? successes.push('Facebook') : failures.push(`FB: ${r.error}`));
          }
          if (result.results.instagram) {
            result.results.instagram.forEach(r => r.success ? successes.push('Instagram') : failures.push(`IG: ${r.error}`));
          }
          
          if (failures.length > 0) {
            msg = `Partial Success. Posted on: ${successes.join(', ') || 'None'}. Failed: ${failures.join(', ')}`;
            setStatus({ type: successes.length ? 'info' : 'error', message: msg, isLoading: false });
          } else {
            msg = `Success! Post published to: ${successes.join(', ')}.`;
            setStatus({ type: 'success', message: msg, isLoading: false });
          }
        } else {
           setStatus({ type: 'success', message: `Success! Post published to selected platforms.`, isLoading: false });
        }
        
        setCaption('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsScheduled(false);
        setScheduleTime('');
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to post', isLoading: false });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Cannot connect to backend server. Is it running?', isLoading: false });
    }
  };

  const handlePostTypeChange = (type) => {
    setPostType(type);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (type === 'text') {
      setPlatforms(prev => ({ ...prev, instagram: false })); // Auto-disable IG for text
    }
  };

  return (
    <div>
      <h2 className="page-title">Create New Post</h2>
      <p className="page-subtitle mb-6">Create text, image, or video posts for Social Media</p>

      {status.message && (
        <div style={{
          padding: '16px',
          marginBottom: '24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: status.type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 
                      status.type === 'error' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(79, 172, 254, 0.1)',
          border: `1px solid ${status.type === 'success' ? 'var(--success)' : 
                              status.type === 'error' ? 'var(--danger)' : 'var(--accent-primary)'}`
        }}>
          {status.type === 'success' && <CheckCircle color="var(--success)" />}
          {status.type === 'error' && <XCircle color="var(--danger)" />}
          {status.isLoading && <Loader className="animate-spin" color="var(--accent-primary)" style={{ animation: 'spin 2s linear infinite' }} />}
          <span>{status.message}</span>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className={`btn ${postType === 'text' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handlePostTypeChange('text')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Type size={18} /> Text
        </button>
        <button 
          className={`btn ${postType === 'image' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handlePostTypeChange('image')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ImageIcon size={18} /> Image
        </button>
        <button 
          className={`btn ${postType === 'video' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handlePostTypeChange('video')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Film size={18} /> Video / Reel
        </button>
      </div>

      <div className="grid-2">
        <div className="glass-card" style={{ padding: '24px' }}>
          
          {postType !== 'text' && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept={postType === 'video' ? "video/*" : "image/*"} 
              />
              
              <div 
                className="ai-preview-area" 
                style={{ height: '200px', borderStyle: 'dashed', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  postType === 'video' ? (
                    <video src={previewUrl} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )
                ) : (
                  <>
                    <UploadCloud className="upload-icon" />
                    <p>Click to Upload {postType === 'video' ? 'Video/Reel' : 'Image'}</p>
                  </>
                )}
              </div>
              {postType === 'video' && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255, 171, 0, 0.1)', border: '1px solid rgba(255, 171, 0, 0.3)', borderRadius: '8px', color: '#ffab00', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>💡</span>
                  <span><strong>Pro Tip:</strong> For best results on Facebook Reels, upload a <strong>Vertical Video (9:16)</strong>. Landscape/Square videos may not appear in the Reels tab on mobile.</span>
                </div>
              )}
            </>
          )}
          
          {previewUrl && postType === 'image' && (
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button 
                onClick={handleAutoCrop}
                className="btn btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px' }}
                disabled={status.isLoading}
              >
                <Crop size={16} /> Crop 1:1
              </button>
              <button 
                onClick={handleAutoFit}
                className="btn btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px' }}
                disabled={status.isLoading}
              >
                <Maximize size={16} /> Fit 1:1 (No Crop)
              </button>
            </div>
          )}

          {postType === 'image' && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 'bold' }}>
                <Wand2 size={16} /> AI Image Generation
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  className="input-glass"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={`e.g. A neon glowing ${businessType} in cyberpunk style`}
                  style={{ flex: 1, padding: '8px' }}
                />
                <button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  {isGeneratingImage ? <Loader size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                  Generate
                </button>
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <Tag size={16} />
              Post Title
            </label>
            <input 
              type="text"
              className="input-glass"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Internal name for this post"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <AlignLeft size={16} />
                Caption / Description
              </label>
              <button 
                onClick={handleAIGenerate}
                disabled={isGenerating || (!previewUrl && postType !== 'text')}
                className="btn btn-outline" 
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', opacity: (isGenerating || (!previewUrl && postType !== 'text')) ? 0.5 : 1 }}
                title={(!previewUrl && postType !== 'text') ? "Upload an image first to generate context-aware content" : "Generate caption and hashtags"}
              >
                {isGenerating ? <Loader size={14} className="animate-spin" /> : <Wand2 size={14} />}
                AI Generate
              </button>
            </div>
            <textarea 
              className="input-glass" 
              rows="6" 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your amazing caption here..."
              style={{ resize: 'vertical', minHeight: '100px' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <Hash size={16} />
                Hashtags
              </label>
              <input 
                type="text"
                className="input-glass"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder={`#${businessType.replace(/\s+/g, '').toLowerCase()} #trending`}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <Link size={16} />
                Call to Action (CTA)
              </label>
              <input 
                type="text"
                className="input-glass"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Shop Now, Learn More..."
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Publishing Settings</h3>
          
          <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-secondary)' }}>Select Platforms</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button 
              className={`btn ${platforms.facebook ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => togglePlatform('facebook')}
              style={{ flex: 1 }}
            >
              Facebook
            </button>
            <button 
              className={`btn ${platforms.instagram ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (postType === 'text') {
                  setStatus({ type: 'error', message: 'Instagram does not support text-only posts.' });
                  return;
                }
                togglePlatform('instagram');
              }}
              style={{ flex: 1 }}
              disabled={postType === 'text'}
              title={postType === 'text' ? 'Instagram requires Image/Video' : ''}
            >
              Instagram
            </button>
            <button 
              className={`btn ${platforms.whatsapp ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => togglePlatform('whatsapp')}
              style={{ flex: 1 }}
            >
              WhatsApp
            </button>
            <button 
              className={`btn ${platforms.google ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => togglePlatform('google')}
              style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }}
              disabled={true}
              title="Google API pending approval"
            >
              Google
            </button>
          </div>

          {platforms.whatsapp && (
            <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>WhatsApp Recipients</label>
              <input 
                type="text" 
                className="input-glass"
                value={whatsappRecipients}
                onChange={(e) => setWhatsappRecipients(e.target.value)}
                placeholder="e.g. 919876543210, 918888888888"
                style={{ width: '100%' }}
              />
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '8px' }}>
                Enter phone numbers with country code, separated by commas.
              </small>
            </div>
          )}

          <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-secondary)' }}>Timing</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button 
              className={`btn ${!isScheduled ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setIsScheduled(false)}
              style={{ flex: 1 }}
            >
              Publish Now
            </button>
            <button 
              className={`btn ${isScheduled ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setIsScheduled(true)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Clock size={16} /> Schedule
            </button>
          </div>

          {isScheduled && (
            <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Select Date & Time</label>
              <input 
                type="datetime-local" 
                className="input-glass"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={{ width: '100%', colorScheme: 'dark' }}
              />
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '8px' }}>
                Note: Must be at least 10 minutes in the future.
              </small>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '40px' }}>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handlePost} disabled={status.isLoading}>
              {status.isLoading ? (isScheduled ? 'Scheduling...' : 'Publishing...') : (isScheduled ? 'Schedule Post' : `Publish ${postType === 'text' ? 'Status' : postType === 'video' ? 'Reel/Video' : 'Photo'} Now`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreator;
