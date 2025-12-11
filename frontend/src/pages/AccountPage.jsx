import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../state/AuthContext.jsx';

function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutSettings, setPayoutSettings] = useState({
    withdrawUpiId: '',
    withdrawName: '',
  });
  const [savingPayout, setSavingPayout] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [walletRes, payoutRes] = await Promise.all([
          api.get('/wallet/me'),
          api.get('/wallet/payout-settings').catch(() => null),
        ]);

        if (!mounted) return;

        setWallet(walletRes.data.wallet);

        if (payoutRes && payoutRes.data) {
          setPayoutSettings({
            withdrawUpiId: payoutRes.data.withdrawUpiId || '',
            withdrawName: payoutRes.data.withdrawName || '',
          });
        }

        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        // eslint-disable-next-line no-console
        console.error(err);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const isAdmin = user?.isAdmin;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleAdminTopup = async () => {
    if (!isAdmin) return;
    try {
      const targetUserId = user?.id || user?._id;
      if (!targetUserId) {
        // eslint-disable-next-line no-alert
        window.alert('Could not detect your user id for top-up. Please log out and log in again.');
        return;
      }

      const res = await api.post('/wallet/admin/manual-recharge', {
        userId: targetUserId,
        amount: 500,
        note: 'admin_test_topup',
      });
      setWallet(res.data.wallet);
      // eslint-disable-next-line no-alert
      window.alert('Added ₹500 balance to your wallet (admin test top-up).');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert('Top-up failed');
    }
  };

  const handlePayoutChange = (field, value) => {
    setPayoutSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePayout = async () => {
    setError('');
    setMessage('');

    if (!payoutSettings.withdrawUpiId) {
      setError('Please enter your UPI ID');
      return;
    }

    try {
      setSavingPayout(true);
      const res = await api.put('/wallet/payout-settings', {
        withdrawMethod: 'UPI',
        withdrawUpiId: payoutSettings.withdrawUpiId,
        withdrawName: payoutSettings.withdrawName,
      });

      setPayoutSettings({
        withdrawUpiId: res.data.withdrawUpiId || '',
        withdrawName: res.data.withdrawName || '',
      });
      setMessage('Withdrawal account saved successfully.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to save withdrawal account');
    } finally {
      setSavingPayout(false);
    }
  };

  const handleWithdraw = async () => {
    setError('');
    setMessage('');

    if (!withdrawAmount) {
      setError('Enter amount to withdraw');
      return;
    }

    try {
      const res = await api.post('/wallet/withdraw', {
        amount: withdrawAmount,
      });
      setWallet(res.data.wallet);
      setWithdrawAmount('');
      setMessage('Withdraw request submitted. Once approved by admin it will be paid to your UPI.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to submit withdraw request');
    }
  };

  const handleVipClick = () => {
    const currentVip = user?.vipLevel ?? 0;

    if (currentVip >= 3) {
      navigate('/invest');
      return;
    }

    let vipTargetLevel = 2;
    if (currentVip >= 2 && currentVip < 3) {
      vipTargetLevel = 3;
    }

    navigate('/recharge', { state: { vipTargetLevel } });
  };

  const handleTelegramClick = () => {
    window.open('https://t.me', '_blank', 'noopener');
  };

  return (
    <div className="page account-page">
      <section className="section-card account-header-card">
        <div className="account-main-row">
          <div>
            <div className="account-name">{user?.nickname || 'Investor'}</div>
            <div className="account-phone">{user?.phone}</div>
          </div>
          <div className="vip-pill">VIP {user?.vipLevel ?? 0}</div>
        </div>
        {wallet && (
          <div className="account-balance-row">
            <div>
              <div className="summary-label">Recharge Balance</div>
              <div className="summary-value">₹{wallet.availableBalance.toFixed(2)}</div>
            </div>
            <div>
              <div className="summary-label">Total Withdrawn</div>
              <div className="summary-value">₹{wallet.totalWithdraw.toFixed(2)}</div>
            </div>
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-title">My Business</div>
        <div className="grid-two">
          <button type="button" className="ghost-button">Balance</button>
          <button type="button" className="ghost-button">Rewards</button>
        </div>
      </section>

      <section className="section-card">
        <div className="section-title">Withdrawal Account</div>
        <p style={{ fontSize: '0.8rem', marginTop: 0 }}>
          Funds will be sent to this UPI ID when your withdraw requests are approved.
        </p>
        <div className="grid-two">
          <div>
            <div className="summary-label">UPI ID</div>
            <input
              type="text"
              className="auth-input"
              placeholder="your-upi@ybl"
              value={payoutSettings.withdrawUpiId}
              onChange={(e) => handlePayoutChange('withdrawUpiId', e.target.value)}
            />
          </div>
          <div>
            <div className="summary-label">Account Name (optional)</div>
            <input
              type="text"
              className="auth-input"
              placeholder="UPI name"
              value={payoutSettings.withdrawName}
              onChange={(e) => handlePayoutChange('withdrawName', e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ marginTop: '0.75rem' }}
          onClick={handleSavePayout}
          disabled={savingPayout}
        >
          {savingPayout ? 'Saving...' : 'Save Withdrawal Account'}
        </button>
      </section>

      <section className="section-card">
        <div className="section-title">Withdraw Funds</div>
        <p style={{ fontSize: '0.8rem', marginTop: 0 }}>
          Minimum withdrawal amount is ₹500. Requests will be processed by admin and
          paid to your saved UPI ID.
        </p>
        {wallet && (
          <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Available balance: <strong>₹{wallet.availableBalance.toFixed(2)}</strong>
          </p>
        )}
        <input
          type="number"
          className="auth-input"
          placeholder="Enter amount to withdraw"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <button
          type="button"
          className="primary-button"
          style={{ marginTop: '0.75rem' }}
          onClick={handleWithdraw}
        >
          Request Withdraw
        </button>
        {error && <div className="auth-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
        {message && !error && (
          <div className="section-card info-card" style={{ marginTop: '0.75rem' }}>
            <p style={{ margin: 0 }}>{message}</p>
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-title">Other Services</div>
        <div className="grid-two">
          <button
            type="button"
            className="ghost-button"
            onClick={() => navigate('/help')}
          >
            Help
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={handleVipClick}
          >
            VIP
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={handleTelegramClick}
          >
            Telegram
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => navigate('/notice')}
          >
            Notice
          </button>
        </div>
      </section>

      <section className="section-card">
        <div className="section-title">Security</div>
        {isAdmin && (
          <button
            type="button"
            className="secondary-button"
            onClick={handleAdminTopup}
            style={{ marginBottom: '0.5rem' }}
          >
            Add ₹500 Test Balance (Admin)
          </button>
        )}
        {isAdmin && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/admin')}
            style={{ marginBottom: '0.5rem' }}
          >
            Open Admin Panel
          </button>
        )}
        <button type="button" className="secondary-button" onClick={handleLogout}>
          Logout
        </button>
      </section>

      {loading && (
        <div className="section-card">
          <div className="section-title">Loading wallet</div>
          <p>Please wait...</p>
        </div>
      )}
    </div>
  );
}

export default AccountPage;
