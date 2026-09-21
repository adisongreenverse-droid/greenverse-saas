import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (e) => {
      const { message, type = 'info' } = e.detail;
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 9999
    }}>
      {toasts.map(toast => (
        <div key={toast.id} className="glass-card" style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(20, 20, 20, 0.95)',
          border: `1px solid ${toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--danger)' : 'var(--accent-primary)'}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          minWidth: '300px',
          maxWidth: '400px'
        }}>
          {toast.type === 'success' && <CheckCircle size={24} color="var(--success)" />}
          {toast.type === 'error' && <XCircle size={24} color="var(--danger)" />}
          {toast.type === 'info' && <Info size={24} color="var(--accent-primary)" />}
          <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>
            {toast.message}
          </div>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export const showToast = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
};

export default ToastNotification;
