import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('Please enter phone number and password');
      return;
    }

    try {
      setLoading(true);
      await login(phone, password);
      navigate('/', { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Come to Success</h1>
          <p className="auth-subtitle">Login to your TurboWealth account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="phone">
            Phone Number
            <div className="auth-input-row">
              <span className="auth-input-prefix">+91</span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="auth-input auth-input-main"
              />
            </div>
          </label>

          <label className="auth-label" htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="auth-input"
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login Now'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don&apos;t have an account?</span>
          <Link to="/register" className="link-strong">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
