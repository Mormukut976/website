import { useEffect, useState } from 'react';
import api from '../services/api.js';

const ADMIN_TABS = ['Deposits', 'Withdrawals', 'Plans', 'Blogs', 'Users'];

function SectionCard({ title, children, actions }) {
  return (
    <div className="admin-section-card">
      <div className="admin-section-header">
        <h2>{title}</h2>
        {actions && <div className="admin-section-actions">{actions}</div>}
      </div>
      <div className="admin-section-body">{children}</div>
    </div>
  );
}

function AdminPage() {
  const [activeTab, setActiveTab] = useState('Deposits');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);

  const [newPlan, setNewPlan] = useState({
    name: '',
    code: '',
    unitPrice: '',
    dailyEarnings: '',
    durationDays: '',
  });

  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [vipEdits, setVipEdits] = useState({});

  const loadDeposits = async () => {
    const res = await api.get('/deposits/admin', { params: { status: 'PENDING' } });
    setDeposits(res.data);
  };

  const loadWithdrawals = async () => {
    const res = await api.get('/wallet/admin/withdrawals', { params: { status: 'PENDING' } });
    setWithdrawals(res.data);
  };

  const loadPlans = async () => {
    const res = await api.get('/plans/admin');
    setPlans(res.data);
  };

  const loadUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data);
  };

  const loadBlogs = async () => {
    const res = await api.get('/blogs/admin');
    setBlogs(res.data);
  };

  const refreshTab = async (tab = activeTab) => {
    setError('');
    setLoading(true);
    try {
      if (tab === 'Deposits') await loadDeposits();
      if (tab === 'Withdrawals') await loadWithdrawals();
      if (tab === 'Plans') await loadPlans();
      if (tab === 'Users') await loadUsers();
      if (tab === 'Blogs') await loadBlogs();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTab('Deposits');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApproveDeposit = async (id) => {
    try {
      await api.post(`/deposits/admin/${id}/approve`);
      await refreshTab('Deposits');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert('Failed to approve deposit');
    }
  };

  const handleRejectDeposit = async (id) => {
    try {
      await api.post(`/deposits/admin/${id}/reject`);
      await refreshTab('Deposits');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert('Failed to reject deposit');
    }
  };

  const handleApproveWithdraw = async (id) => {
    try {
      await api.post(`/wallet/admin/withdrawals/${id}/approve`);
      await refreshTab('Withdrawals');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert('Failed to approve withdraw');
    }
  };

  const handleRejectWithdraw = async (id) => {
    try {
      await api.post(`/wallet/admin/withdrawals/${id}/reject`);
      await refreshTab('Withdrawals');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert('Failed to reject withdraw');
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.code || !newPlan.unitPrice) {
      // eslint-disable-next-line no-alert
      window.alert('Please fill name, code and unit price');
      return;
    }

    try {
      await api.post('/plans/admin', {
        ...newPlan,
        unitPrice: Number(newPlan.unitPrice),
        dailyEarnings: Number(newPlan.dailyEarnings || 0),
        durationDays: Number(newPlan.durationDays || 1),
      });
      setNewPlan({ name: '', code: '', unitPrice: '', dailyEarnings: '', durationDays: '' });
      await refreshTab('Plans');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert(err?.response?.data?.message || 'Failed to create plan');
    }
  };

  const handleTogglePlanActive = async (plan) => {
    try {
      await api.put(`/plans/admin/${plan._id}`, { isActive: !plan.isActive });
      await refreshTab('Plans');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert('Failed to update plan');
    }
  };

  const handleCreateBlog = async () => {
    if (!newBlog.title || !newBlog.content) {
      // eslint-disable-next-line no-alert
      window.alert('Please fill blog title and content');
      return;
    }

    try {
      await api.post('/blogs/admin', newBlog);
      setNewBlog({ title: '', content: '' });
      await refreshTab('Blogs');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      window.alert('Failed to create blog post');
    }
  };

  const renderDeposits = () => (
    <SectionCard
      title="Deposit Requests"
      actions={(
        <button type="button" className="admin-ghost-small" onClick={() => refreshTab('Deposits')}>
          Refresh
        </button>
      )}
    >
      {deposits.length === 0 && <p>No pending deposit requests.</p>}
      <div className="admin-table">
        {deposits.map((d) => (
          <div key={d._id} className="admin-row">
            <div>
              <div className="admin-row-main">₹{d.amount} • {d.currency}</div>
              <div className="admin-row-sub">User: {d.user?.phone || d.user}</div>
              <div className="admin-row-sub">Txn: {d.txnId || 'N/A'}</div>
            </div>
            <div className="admin-row-actions">
              <button
                type="button"
                className="admin-btn approve"
                onClick={() => handleApproveDeposit(d._id)}
              >
                Approve
              </button>
              <button
                type="button"
                className="admin-btn reject"
                onClick={() => handleRejectDeposit(d._id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderWithdrawals = () => (
    <SectionCard
      title="Withdraw Requests"
      actions={(
        <button type="button" className="admin-ghost-small" onClick={() => refreshTab('Withdrawals')}>
          Refresh
        </button>
      )}
    >
      {withdrawals.length === 0 && <p>No pending withdraw requests.</p>}
      <div className="admin-table">
        {withdrawals.map((w) => (
          <div key={w._id} className="admin-row">
            <div>
              <div className="admin-row-main">₹{w.amount} • {w.currency}</div>
              <div className="admin-row-sub">User: {w.user?.phone || w.user}</div>
              <div className="admin-row-sub">UPI: {w.meta?.account}</div>
            </div>
            <div className="admin-row-actions">
              <button
                type="button"
                className="admin-btn approve"
                onClick={() => handleApproveWithdraw(w._id)}
              >
                Approve
              </button>
              <button
                type="button"
                className="admin-btn reject"
                onClick={() => handleRejectWithdraw(w._id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderPlans = () => (
    <>
      <SectionCard title="Create New Plan">
        <div className="admin-grid-two">
          <div>
            <label className="summary-label">Name</label>
            <input
              type="text"
              className="auth-input"
              value={newPlan.name}
              onChange={(e) => setNewPlan((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="summary-label">Code</label>
            <input
              type="text"
              className="auth-input"
              value={newPlan.code}
              onChange={(e) => setNewPlan((p) => ({ ...p, code: e.target.value }))}
            />
          </div>
          <div>
            <label className="summary-label">Unit Price (₹)</label>
            <input
              type="number"
              className="auth-input"
              value={newPlan.unitPrice}
              onChange={(e) => setNewPlan((p) => ({ ...p, unitPrice: e.target.value }))}
            />
          </div>
          <div>
            <label className="summary-label">Daily Earnings (₹)</label>
            <input
              type="number"
              className="auth-input"
              value={newPlan.dailyEarnings}
              onChange={(e) => setNewPlan((p) => ({ ...p, dailyEarnings: e.target.value }))}
            />
          </div>
          <div>
            <label className="summary-label">Duration (days)</label>
            <input
              type="number"
              className="auth-input"
              value={newPlan.durationDays}
              onChange={(e) => setNewPlan((p) => ({ ...p, durationDays: e.target.value }))}
            />
          </div>
        </div>
        <button type="button" className="primary-button" style={{ marginTop: '0.75rem' }} onClick={handleCreatePlan}>
          Create Plan
        </button>
      </SectionCard>

      <SectionCard
        title="Existing Plans"
        actions={(
          <button type="button" className="admin-ghost-small" onClick={() => refreshTab('Plans')}>
            Refresh
          </button>
        )}
      >
        {plans.length === 0 && <p>No plans defined yet.</p>}
        <div className="admin-table">
          {plans.map((p) => (
            <div key={p._id} className="admin-row">
              <div>
                <div className="admin-row-main">
                  {p.code} • {p.name}
                </div>
                <div className="admin-row-sub">
                  ₹{p.unitPrice} / day ₹{p.dailyEarnings} • {p.durationDays} days
                </div>
                <div className="admin-row-sub">Active: {p.isActive ? 'Yes' : 'No'}</div>
              </div>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="admin-btn approve"
                  onClick={() => handleTogglePlanActive(p)}
                >
                  {p.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );

  const renderBlogs = () => (
    <>
      <SectionCard title="Create Blog Post">
        <div className="admin-grid-two">
          <div>
            <label className="summary-label">Title</label>
            <input
              type="text"
              className="auth-input"
              value={newBlog.title}
              onChange={(e) => setNewBlog((b) => ({ ...b, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="summary-label">Content</label>
            <textarea
              className="auth-input"
              rows={4}
              value={newBlog.content}
              onChange={(e) => setNewBlog((b) => ({ ...b, content: e.target.value }))}
            />
          </div>
        </div>
        <button type="button" className="primary-button" style={{ marginTop: '0.75rem' }} onClick={handleCreateBlog}>
          Publish Blog
        </button>
      </SectionCard>

      <SectionCard
        title="Existing Blog Posts"
        actions={(
          <button type="button" className="admin-ghost-small" onClick={() => refreshTab('Blogs')}>
            Refresh
          </button>
        )}
      >
        {blogs.length === 0 && <p>No blog posts yet.</p>}
        <div className="admin-table">
          {blogs.map((b) => (
            <div key={b._id} className="admin-row">
              <div>
                <div className="admin-row-main">{b.title}</div>
                <div className="admin-row-sub">{new Date(b.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );

  const renderUsers = () => (
    <SectionCard
      title="Users"
      actions={(
        <button type="button" className="admin-ghost-small" onClick={() => refreshTab('Users')}>
          Refresh
        </button>
      )}
    >
      {users.length === 0 && <p>No users found.</p>}
      <div className="admin-table">
        {users.map((u) => (
          <div key={u._id} className="admin-row">
            <div>
              <div className="admin-row-main">{u.phone}</div>
              <div className="admin-row-sub">{u.nickname || 'No nickname'} • VIP {u.vipLevel}</div>
              <div className="admin-row-sub">Role: {u.isAdmin ? 'Admin' : 'User'}</div>
            </div>
            <div className="admin-row-actions">
              <div>
                <div className="admin-row-sub">Set VIP</div>
                <input
                  type="number"
                  className="auth-input"
                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                  value={vipEdits[u._id] ?? u.vipLevel ?? 0}
                  onChange={(e) =>
                    setVipEdits((prev) => ({ ...prev, [u._id]: e.target.value }))}
                />
                <button
                  type="button"
                  className="admin-ghost-small"
                  style={{ marginTop: '0.25rem' }}
                  onClick={async () => {
                    try {
                      const vipValue = vipEdits[u._id] ?? u.vipLevel ?? 0;
                      await api.put(`/admin/users/${u._id}`, {
                        vipLevel: Number(vipValue),
                      });
                      await refreshTab('Users');
                    } catch (err) {
                      // eslint-disable-next-line no-console
                      console.error(err);
                      // eslint-disable-next-line no-alert
                      window.alert('Failed to update VIP level');
                    }
                  }}
                >
                  Save VIP
                </button>
              </div>
              <button
                type="button"
                className="admin-btn approve"
                onClick={async () => {
                  try {
                    await api.put(`/admin/users/${u._id}`, {
                      isAdmin: !u.isAdmin,
                    });
                    await refreshTab('Users');
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    // eslint-disable-next-line no-alert
                    window.alert('Failed to update user role');
                  }
                }}
              >
                {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  let content;
  if (activeTab === 'Deposits') content = renderDeposits();
  if (activeTab === 'Withdrawals') content = renderWithdrawals();
  if (activeTab === 'Plans') content = renderPlans();
  if (activeTab === 'Blogs') content = renderBlogs();
  if (activeTab === 'Users') content = renderUsers();

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div className="admin-title-block">
            <div className="admin-pill">TurboWealth</div>
            <h1>Control Center</h1>
            <p>Full control over deposits, withdrawals, plans, blogs and users.</p>
          </div>
        </header>

        <div className="admin-tabs">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`admin-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                refreshTab(tab);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && (
          <div className="section-card" style={{ marginTop: '0.75rem' }}>
            <div className="section-title">Loading</div>
            <p>Fetching admin data...</p>
          </div>
        )}

        {error && (
          <div className="section-card error-card" style={{ marginTop: '0.75rem' }}>
            <div className="section-title">Error</div>
            <p>{error}</p>
          </div>
        )}

        <div className="admin-content">{content}</div>
      </div>
    </div>
  );
}

export default AdminPage;
