import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api.js';

function RechargePage() {
  const [config, setConfig] = useState({ minDeposit: 150, upiId: '' });
  const [amount, setAmount] = useState('');
  const [txnId, setTxnId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [myDeposits, setMyDeposits] = useState([]);
  const location = useLocation();
  const vipTargetLevel = location.state?.vipTargetLevel;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [configRes, mineRes] = await Promise.all([
          api.get('/deposits/config'),
          api.get('/deposits/mine'),
        ]);

        if (!mounted) return;

        setConfig(configRes.data || { minDeposit: 150, upiId: '' });
        setMyDeposits(mineRes.data || []);
        setLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        if (!mounted) return;
        setLoading(false);
        setError('Failed to load recharge info');
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Invalid amount');
      return;
    }

    if (numericAmount < (config.minDeposit || 150)) {
      setError(`Minimum deposit amount is ₹${config.minDeposit || 150}`);
      return;
    }

    if (!txnId) {
      setError('Please enter the UPI transaction ID / UTR after payment');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/deposits', {
        amount: numericAmount,
        txnId,
      });

      setAmount('');
      setTxnId('');
      setMessage('Recharge request submitted. Admin will verify and add money to your wallet.');
      setMyDeposits((prev) => [res.data, ...prev]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to submit deposit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page recharge-page">
      <section className="section-card">
        <div className="section-title">Add Money to Wallet</div>
        <p style={{ fontSize: '0.82rem', marginTop: 0 }}>
          Send payment to the TurboWealth UPI below using PhonePe/UPI. After payment, enter
          the amount and UPI transaction ID so admin can verify and add it to your wallet.
        </p>

        {vipTargetLevel === 2 && (
          <div
            style={{
              marginTop: '0.6rem',
              fontSize: '0.8rem',
              padding: '0.6rem 0.8rem',
              borderRadius: '0.75rem',
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            To upgrade to <strong>VIP 2</strong>, pay <strong>₹800</strong> to this UPI ID.
            After payment, submit a recharge request with note like
            {' '}
            <strong>VIP2 UPGRADE</strong>
            {' '}
            and contact support on Telegram to update your VIP level.
          </div>
        )}

        {vipTargetLevel === 3 && (
          <div
            style={{
              marginTop: '0.6rem',
              fontSize: '0.8rem',
              padding: '0.6rem 0.8rem',
              borderRadius: '0.75rem',
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            To upgrade to <strong>VIP 3</strong>, pay <strong>₹3000</strong> to this UPI ID.
            After payment, submit a recharge request with note like
            {' '}
            <strong>VIP3 UPGRADE</strong>
            {' '}
            and contact support on Telegram to update your VIP level.
          </div>
        )}

        <div className="upi-box">
          <div className="upi-info">
            <div className="summary-label">UPI ID</div>
            <div className="upi-id-text">{config.upiId || 'banadrabar@ybl'}</div>
            <div className="summary-label" style={{ marginTop: '0.35rem' }}>
              Minimum deposit
            </div>
            <div className="summary-value">
              ₹{config.minDeposit || 150}
            </div>
          </div>
          <div className="upi-qr-wrap">
            <img
              src="/upi-qr.png"
              alt="TurboWealth UPI QR"
              className="upi-qr-img"
            />
            <div className="upi-qr-hint">Scan with any UPI app</div>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-title">Submit Recharge Request</div>
        <div className="grid-two">
          <div>
            <div className="summary-label">Amount (INR)</div>
            <input
              type="number"
              className="auth-input"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <div className="summary-label">UPI Transaction ID / UTR</div>
            <input
              type="text"
              className="auth-input"
              placeholder="Enter UPI transaction/UTR ID"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ marginTop: '0.75rem' }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit for Approval'}
        </button>
        {error && <div className="auth-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
        {message && !error && (
          <div className="section-card info-card" style={{ marginTop: '0.75rem' }}>
            <p style={{ margin: 0 }}>{message}</p>
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-title">My Recharge Requests</div>
        {loading && <p>Loading...</p>}
        {!loading && myDeposits.length === 0 && (
          <p style={{ fontSize: '0.85rem' }}>No recharge requests yet.</p>
        )}
        <div className="admin-table">
          {myDeposits.map((d) => (
            <div key={d._id} className="admin-row">
              <div>
                <div className="admin-row-main">
                  ₹{d.amount} • {d.currency}
                </div>
                <div className="admin-row-sub">Txn: {d.txnId || 'N/A'}</div>
                <div className="admin-row-sub">
                  {new Date(d.createdAt).toLocaleString()} • Status: {d.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RechargePage;
