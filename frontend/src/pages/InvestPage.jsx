import { useEffect, useState } from 'react';
import api from '../services/api.js';

function InvestPage() {
  const [plans, setPlans] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [plansRes, walletRes, investmentsRes] = await Promise.all([
          api.get('/plans'),
          api.get('/wallet/me'),
          api.get('/plans/mine'),
        ]);

        if (!mounted) return;

        setPlans(plansRes.data);
        setWallet(walletRes.data.wallet);
        setInvestments(investmentsRes.data || []);
        setLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        if (!mounted) return;
        setError('Failed to load investment products or wallet');
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleInvest = async (planId) => {
    setActionMessage('');
    try {
      const res = await api.post('/plans/invest', { planId });
      if (res.status === 201) {
        const updatedWallet = res.data?.wallet;
        if (updatedWallet) {
          setWallet(updatedWallet);
        }
        try {
          const invRes = await api.get('/plans/mine');
          setInvestments(invRes.data || []);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
        setActionMessage('Investment created successfully. Daily earnings will be credited automatically.');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setActionMessage(err?.response?.data?.message || 'Investment failed');
    }
  };

  return (
    <div className="page invest-page">
      <div className="tabs-row">
        <button type="button" className="tab active">Stable</button>
        <button type="button" className="tab">Welfare</button>
        <button type="button" className="tab">Activity</button>
      </div>

      {wallet && (
        <section className="section-card">
          <div className="section-title">Wallet Balance</div>
          <p style={{ fontSize: '0.85rem', marginTop: 0 }}>
            Available balance used for investments.
          </p>
          <div className="summary-strip">
            <div className="summary-item">
              <span className="summary-label">Recharge Balance</span>
              <span className="summary-value">₹{wallet.availableBalance.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Locked (Invested)</span>
              <span className="summary-value">₹{wallet.lockedBalance.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Recharge</span>
              <span className="summary-value">₹{wallet.totalRecharge.toFixed(2)}</span>
            </div>
          </div>
        </section>
      )}

      {!loading && investments && investments.length > 0 && (
        <section className="section-card">
          <div className="section-title">My Investments</div>
          <p style={{ fontSize: '0.82rem', marginTop: 0 }}>
            These are the plans you have already purchased. Earnings are credited daily until
            maturity.
          </p>
          <div className="plans-list">
            {investments.map((inv) => {
              const plan = inv.plan || {};
              const end = inv.endDate ? new Date(inv.endDate) : null;
              const now = new Date();
              const msDiff = end ? end.getTime() - now.getTime() : 0;
              const daysRemaining = end ? Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24))) : 0;

              return (
                <div key={inv._id} className="plan-card">
                  <div className="plan-main">
                    <div className="plan-left">
                      <div className="plan-code">{plan.code || 'Plan'}</div>
                      <div className="plan-meta">
                        <div>
                          <span className="plan-label">Amount</span>
                          <span className="plan-value">₹{inv.amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="plan-label">Status</span>
                          <span className="plan-value">{inv.status}</span>
                        </div>
                        {end && (
                          <div>
                            <span className="plan-label">Maturity Date</span>
                            <span className="plan-value">{end.toLocaleDateString()}</span>
                          </div>
                        )}
                        <div>
                          <span className="plan-label">Days Remaining</span>
                          <span className="plan-value">{daysRemaining}</span>
                        </div>
                      </div>
                    </div>
                    <div className="plan-right">
                      <div className="plan-upgrade">Active Plan</div>
                      <div className="plan-upgrade-tier">{plan.code || ''}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {loading && (
        <div className="section-card">
          <div className="section-title">Loading products</div>
          <p>Please wait...</p>
        </div>
      )}

      {error && !loading && (
        <div className="section-card error-card">
          <div className="section-title">Error</div>
          <p>{error}</p>
        </div>
      )}

      {actionMessage && (
        <div className="section-card info-card">
          <p>{actionMessage}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="plans-list">
          {plans.map((plan) => (
            <div key={plan._id} className="plan-card">
              <div className="plan-main">
                <div className="plan-left">
                  <div className="plan-code">{plan.code}</div>
                  <div className="plan-meta">
                    <div>
                      <span className="plan-label">Unit Price</span>
                      <span className="plan-value">₹{plan.unitPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="plan-label">Daily Earnings</span>
                      <span className="plan-value">₹{plan.dailyEarnings.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="plan-label">Duration</span>
                      <span className="plan-value">{plan.durationDays} Days</span>
                    </div>
                    <div>
                      <span className="plan-label">Total Revenue</span>
                      <span className="plan-value">₹{plan.totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="plan-right">
                  <div className="plan-upgrade">Upgrade</div>
                  <div className="plan-upgrade-tier">{plan.code}</div>
                </div>
              </div>

              <button
                type="button"
                className="plan-button primary-button"
                onClick={() => handleInvest(plan._id)}
              >
                Invest Now
              </button>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="section-card">
              <div className="section-title">No products yet</div>
              <p>Ask admin to seed default investment plans.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InvestPage;
