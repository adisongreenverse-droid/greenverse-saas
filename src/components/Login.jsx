import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, Key } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const payload = { email, password };
      if (!isLogin) payload.inviteCode = inviteCode;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isLogin) {
        // Handle successful login
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.token);
      } else {
        // Handle successful registration
        setIsLogin(true);
        setInviteCode('');
        setError('Registration successful! Please login.'); // Using error state just to show a message, could use a success state instead
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="logo-icon mx-auto mb-4" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>G</div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Greenverse</h2>
          <p className="text-secondary">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        {error && (
          <div className={`login-alert ${error.includes('successful') ? 'login-alert-success' : 'login-alert-error'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Access Code (Invite Only)</label>
              <div className="input-wrapper">
                <Key className="input-icon" size={18} />
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter admin invite code"
                />
              </div>
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          <p className="text-secondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
