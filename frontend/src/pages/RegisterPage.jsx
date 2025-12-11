import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('Phone and password are required');
      return;
    }

    try {
      setLoading(true);
      await register({ phone, password, nickname, inviteCode });
      navigate('/', { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Come to Success</h1>
          <p className="auth-subtitle">Create your TurboWealth account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="phone">
            Mobile Number
            <div className="auth-input-row">
              <span className="auth-input-prefix">+91</span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="auth-input auth-input-main"
              />
            </div>
          </label>

          <label className="auth-label" htmlFor="nickname">
            Nickname
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nickname"
              className="auth-input"
            />
          </label>

          <label className="auth-label" htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Login password"
              className="auth-input"
            />
          </label>

          <label className="auth-label" htmlFor="inviteCode">
            Invitation Code (optional)
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invitation code"
              className="auth-input"
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="link-strong">
            Login Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
