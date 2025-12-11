import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../state/AuthContext.jsx';

function DashboardPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    api
      .get('/wallet/me')
      .then((res) => {
        if (!mounted) return;
        setWallet(res.data.wallet);
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        if (!mounted) return;
        setError('Failed to load wallet');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const rechargeBalance = wallet?.availableBalance ?? 0;
  const withdrawalBalance = wallet?.totalWithdraw ?? 0;

  return (
    <div className="page dashboard-page">
      <section className="hero-banner">
        <div className="hero-text">
          <div className="badge">TurboWealth</div>
          <h2>Welcome back{user?.nickname ? `, ${user.nickname}` : ''}</h2>
          <p>Experience smart investment products with daily earnings.</p>
        </div>
      </section>

      <section className="summary-strip">
        <div className="summary-item">
          <span className="summary-label">Recharge Balance</span>
          <span className="summary-value">₹{rechargeBalance.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Product Income</span>
          <span className="summary-value">₹0.00</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Withdrawal Total</span>
          <span className="summary-value">₹{withdrawalBalance.toFixed(2)}</span>
        </div>
      </section>

      <section className="quick-actions">
        <button
          type="button"
          className="quick-action-button primary"
          onClick={() => navigate('/recharge')}
        >
          Recharge
        </button>
        <button
          type="button"
          className="quick-action-button"
          onClick={() => navigate('/account')}
        >
          Withdraw
        </button>
        <button
          type="button"
          className="quick-action-button"
          onClick={() => navigate('/account')}
        >
          My Team
        </button>
        <button
          type="button"
          className="quick-action-button"
          onClick={() => window.open('https://t.me', '_blank', 'noopener')}
        >
          Telegram
        </button>
      </section>

      {loading && (
        <div className="section-card">
          <div className="section-title">Loading</div>
          <p>Fetching your wallet data...</p>
        </div>
      )}

      {error && (
        <div className="section-card error-card">
          <div className="section-title">Wallet</div>
          <p>{error}</p>
        </div>
      )}

      <section className="section-card">
        <div className="section-title">Rewards</div>
        <p>Daily check-in rewards and lucky draw can be configured here later.</p>
      </section>
    </div>
  );
}

export default DashboardPage;
