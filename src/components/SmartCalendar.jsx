import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader, X, Trash2, Edit2, Ban } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const SmartCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState(null);
  
  const [editingPostId, setEditingPostId] = useState(null);
  const [editFormData, setEditFormData] = useState({ message: '', scheduled_publish_time: '' });

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to fetch posts for calendar", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCancel = async (postId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled post?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/cancel`, { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setPosts(posts.map(p => p.id === postId ? { ...p, status: 'cancelled' } : p));
        if (selectedPosts) setSelectedPosts(selectedPosts.map(p => p.id === postId ? { ...p, status: 'cancelled' } : p));
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        if (selectedPosts) setSelectedPosts(selectedPosts.filter(p => p.id !== postId));
      }
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    const dateObj = new Date(post.scheduled_publish_time * 1000);
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);
    
    setEditFormData({
      message: post.message || '',
      scheduled_publish_time: localISOTime
    });
  };

  const handleEditSubmit = async (postId) => {
    try {
      const newTimestamp = Math.floor(new Date(editFormData.scheduled_publish_time).getTime() / 1000);
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: editFormData.message,
          scheduled_publish_time: newTimestamp
        })
      });
      if (res.ok) {
        setPosts(posts.map(p => p.id === postId ? { ...p, message: editFormData.message, scheduled_publish_time: newTimestamp } : p));
        if (selectedPosts) setSelectedPosts(selectedPosts.map(p => p.id === postId ? { ...p, message: editFormData.message, scheduled_publish_time: newTimestamp } : p));
        setEditingPostId(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleDropPost = async (e, targetDayNum) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('postId');
    if (!postId || !targetDayNum) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Create a new date based on target day, keeping original time
    const oldDate = new Date(post.scheduled_publish_time ? post.scheduled_publish_time * 1000 : post.created_at);
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), targetDayNum, oldDate.getHours(), oldDate.getMinutes(), oldDate.getSeconds());
    
    // Only allow dropping if the new time is in the future
    if (newDate.getTime() < Date.now()) {
      alert("Cannot schedule a post in the past.");
      return;
    }

    const newTimestamp = Math.floor(newDate.getTime() / 1000);
    
    // Optimistic UI update
    setPosts(posts.map(p => p.id === postId ? { ...p, scheduled_publish_time: newTimestamp, status: 'pending' } : p));
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: post.message,
          scheduled_publish_time: newTimestamp
        })
      });
      if (!res.ok) {
        // Revert if failed
        fetchPosts();
        alert("Failed to reschedule post.");
      }
    } catch (err) { 
      console.error(err); 
      fetchPosts();
    }
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedMonth = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const totalSlots = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  
  const dates = Array.from({ length: totalSlots }, (_, i) => {
    const dayNum = i - firstDayOfMonth + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  const getPostsForDate = (dayNum) => {
    if (!dayNum) return [];
    return posts.filter(post => {
      const targetTime = post.scheduled_publish_time ? post.scheduled_publish_time * 1000 : new Date(post.created_at).getTime();
      const pDate = new Date(targetTime);
      return pDate.getDate() === dayNum && pDate.getMonth() === currentDate.getMonth() && pDate.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '4px' }}>Content Calendar</h2>
          <p className="page-subtitle">Track your scheduled and past posts</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-glass)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <button className="btn btn-outline" style={{ padding: '4px' }} onClick={prevMonth}><ChevronLeft size={20} /></button>
          <span style={{ fontSize: '1.1rem', fontWeight: '500', minWidth: '140px', textAlign: 'center' }}>
            {isLoading ? <Loader className="animate-spin" size={16} /> : formattedMonth}
          </span>
          <button className="btn btn-outline" style={{ padding: '4px' }} onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {days.map(day => (
          <div key={day} className="calendar-header">{day}</div>
        ))}
        
        {dates.map((date, i) => {
          const isToday = date === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
          const dayPosts = getPostsForDate(date);
          const isValidDate = date !== null;
          
          return (
            <div 
              key={i} 
              className={`calendar-cell ${isToday ? 'today' : ''} ${isValidDate ? 'active' : ''}`}
              onClick={(e) => { 
                // Only open modal if not dragging and we have posts
                if (dayPosts.length > 0 && !e.defaultPrevented) setSelectedPosts(dayPosts); 
              }}
              onDragOver={(e) => {
                if (isValidDate) {
                  e.preventDefault();
                  e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.2)'; // Highlight on hover
                }
              }}
              onDragLeave={(e) => {
                if (isValidDate) {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
              onDrop={(e) => {
                if (isValidDate) {
                  e.currentTarget.style.backgroundColor = '';
                  handleDropPost(e, date);
                }
              }}
              style={{ cursor: dayPosts.length > 0 ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '100px', transition: 'background-color 0.2s' }}
            >
              {isValidDate && <span className="calendar-date">{date}</span>}
              
              {isValidDate && dayPosts.slice(0, 2).map((post, idx) => (
                <div 
                  key={idx} 
                  draggable={post.status === 'pending'}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('postId', post.id);
                    e.stopPropagation();
                  }}
                  title={post.status === 'pending' ? "Drag to reschedule" : ""}
                  style={{ 
                    padding: '4px', 
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-glass)',
                    cursor: post.status === 'pending' ? 'grab' : 'default',
                    opacity: post.status === 'cancelled' ? 0.5 : 1
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent cell click when interacting with specific post if needed
                >
                  {(post.image_url || post.video_url) ? (
                    (post.image_url?.endsWith('.mp4') || post.video_url?.endsWith('.mp4') || post.postType === 'video') ? (
                       <video 
                        src={(post.video_url || post.image_url).startsWith('/') ? `${API_BASE_URL}${post.video_url || post.image_url}` : (post.video_url || post.image_url)} 
                        className="post-thumbnail" 
                        style={{ height: '32px', width: '100%', objectFit: 'cover', borderRadius: '4px', pointerEvents: 'none', backgroundColor: '#000' }} 
                        muted 
                        playsInline
                      />
                    ) : (
                      <img src={post.image_url.startsWith('/') ? `${API_BASE_URL}${post.image_url}` : post.image_url} className="post-thumbnail" alt="Post" style={{ height: '32px', width: '100%', objectFit: 'cover', borderRadius: '4px', pointerEvents: 'none' }} onError={(e) => { e.target.onerror = null; e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    )
                  ) : (
                    <div className="post-thumbnail fallback-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', fontSize: '10px', color: '#aaa', padding: '4px', textAlign: 'center', height: '32px', borderRadius: '4px', pointerEvents: 'none' }}>
                      {post.postType}
                    </div>
                  )}
                  {/* Fallback indicator if image fails to load */}
                  <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', fontSize: '10px', color: '#aaa', padding: '4px', textAlign: 'center', height: '32px', borderRadius: '4px', pointerEvents: 'none' }}>
                    {post.postType}
                  </div>
                  
                  <div className="post-indicator" style={{ marginTop: '4px', justifyContent: 'center', pointerEvents: 'none', display: 'flex', gap: '4px' }}>
                    {post.platforms?.includes('facebook') && <div className="platform-dot" style={{ background: '#1877F2', width: '6px', height: '6px' }} title="Facebook"></div>}
                    {post.platforms?.includes('instagram') && <div className="platform-dot" style={{ background: '#E4405F', width: '6px', height: '6px' }} title="Instagram"></div>}
                    {post.platforms?.includes('whatsapp') && <div className="platform-dot" style={{ background: '#25D366', width: '6px', height: '6px' }} title="WhatsApp"></div>}
                  </div>
                </div>
              ))}
              {dayPosts.length > 2 && (
                <div style={{ fontSize: '10px', color: 'var(--accent-primary)', textAlign: 'center', fontWeight: 'bold' }}>
                  +{dayPosts.length - 2} more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Post Details Modal */}
      {selectedPosts && selectedPosts.length > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <button 
              onClick={() => setSelectedPosts(null)}
              className="btn btn-outline"
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px', border: 'none', zIndex: 10 }}
            >
              <X size={20} />
            </button>
            <h3 style={{ paddingRight: '24px', margin: 0 }}>
              Posts for {new Date(selectedPosts[0].scheduled_publish_time ? selectedPosts[0].scheduled_publish_time * 1000 : selectedPosts[0].created_at).toLocaleDateString()}
            </h3>
            
            {selectedPosts.map((post, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-glass)', opacity: post.status === 'cancelled' ? 0.7 : 1 }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: post.status === 'pending' ? '#eab308' : post.status === 'published' ? '#22c55e' : '#ef4444', color: '#fff', fontWeight: 'bold' }}>
                    {(post.status || 'published').toUpperCase()}
                  </div>
                  
                  {post.status === 'pending' && editingPostId !== post.id && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditClick(post)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }} title="Edit Post">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleCancel(post.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', color: '#eab308', borderColor: 'rgba(234,179,8,0.3)' }} title="Cancel Publish">
                        <Ban size={14} /> Cancel
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} title="Delete Post">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                  {post.status !== 'pending' && (
                    <button onClick={() => handleDelete(post.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} title="Delete Post">
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>

                {(post.image_url || post.video_url) && (
                  (post.image_url?.endsWith('.mp4') || post.video_url?.endsWith('.mp4') || post.postType === 'video') ? (
                    <video 
                      src={(post.video_url || post.image_url).startsWith('/') ? `${API_BASE_URL}${post.video_url || post.image_url}` : (post.video_url || post.image_url)} 
                      controls
                      style={{ width: '100%', borderRadius: '8px', marginBottom: '16px', maxHeight: '200px', backgroundColor: 'rgba(0,0,0,0.2)' }} 
                    />
                  ) : (
                    <img src={post.image_url.startsWith('/') ? `${API_BASE_URL}${post.image_url}` : post.image_url} alt="Post" style={{ width: '100%', borderRadius: '8px', marginBottom: '16px', maxHeight: '200px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.2)' }} />
                  )
                )}
                
                {editingPostId === post.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Publish Time</label>
                      <input 
                        type="datetime-local" 
                        value={editFormData.scheduled_publish_time}
                        onChange={(e) => setEditFormData({...editFormData, scheduled_publish_time: e.target.value})}
                        className="form-input"
                        style={{ width: '100%', marginTop: '4px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-glass)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Caption</label>
                      <textarea 
                        value={editFormData.message}
                        onChange={(e) => setEditFormData({...editFormData, message: e.target.value})}
                        className="form-input"
                        style={{ width: '100%', minHeight: '80px', marginTop: '4px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-glass)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingPostId(null)} className="btn btn-outline" style={{ padding: '6px 12px' }}>Cancel Edit</button>
                      <button onClick={() => handleEditSubmit(post.id)} className="btn btn-primary" style={{ padding: '6px 12px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '4px' }}>Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                      <strong>Time:</strong> {new Date(post.scheduled_publish_time ? post.scheduled_publish_time * 1000 : post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                      <strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{post.postType || 'Image'}</span>
                    </div>
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '14px' }}>
                      <strong>Platforms:</strong> 
                      {post.platforms?.map(p => (
                        <span key={p} style={{ textTransform: 'capitalize', padding: '2px 8px', background: 'var(--accent-primary)', borderRadius: '12px', fontSize: '12px', color: 'white' }}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <strong>Caption:</strong>
                      <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', marginTop: '4px', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                        {post.message || 'No caption provided.'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCalendar;
