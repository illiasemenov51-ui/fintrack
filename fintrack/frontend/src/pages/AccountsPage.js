import React, { useState, useEffect } from 'react';
import { accountApi } from '../services/api';

const formatCurrency = (val, currency = 'USD') => {
  if (!val && val !== 0) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(val);
};

const ACCOUNT_ICONS = {
  CASH: '💵', BANK: '🏦', CREDIT_CARD: '💳', SAVINGS: '🐖', INVESTMENT: '📈'
};

const ACCOUNT_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6', '#EC4899'];

const defaultForm = { name: '', type: 'BANK', balance: '0', currency: 'USD', color: '#3B82F6' };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountApi.getAll();
      setAccounts(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

  const openCreate = () => {
    setEditAccount(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (acc) => {
    setEditAccount(acc);
    setForm({ name: acc.name, type: acc.type, balance: acc.balance?.toString(), currency: acc.currency || 'USD', color: acc.color || '#3B82F6' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, type: form.type, balance: parseFloat(form.balance), currency: form.currency, color: form.color };
      if (editAccount) {
        await accountApi.update(editAccount.id, payload);
      } else {
        await accountApi.create(payload);
      }
      setShowModal(false);
      fetchAccounts();
    } catch (e) { alert(e.response?.data?.error || 'Error saving account'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account? Existing transactions will be preserved.')) return;
    try {
      await accountApi.delete(id);
      fetchAccounts();
    } catch (e) { alert('Error deleting account'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Total balance: {formatCurrency(totalBalance)}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Account</button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <div className="empty-title">No accounts yet</div>
          <p style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 14 }}>Add your first account to get started</p>
          <button className="btn btn-primary" onClick={openCreate}>Add Account</button>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map(acc => (
            <div key={acc.id} className="account-card">
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: acc.color || '#3B82F6', borderRadius: '12px 12px 0 0' }} />
              <div className="account-card-top">
                <span style={{ fontSize: 28 }}>{ACCOUNT_ICONS[acc.type] || '💰'}</span>
                <span className="account-type-badge">{acc.type?.replace('_', ' ')}</span>
              </div>
              <div className="account-name">{acc.name}</div>
              <div className="account-balance" style={{ color: acc.color || 'var(--text-primary)' }}>
                {formatCurrency(acc.balance, acc.currency)}
              </div>
              <div className="account-currency">{acc.currency}</div>
              <div className="account-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(acc)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(acc.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editAccount ? 'Edit Account' : 'New Account'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Account Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Main Checking, Cash Wallet"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="CASH">💵 Cash</option>
                  <option value="BANK">🏦 Bank Account</option>
                  <option value="CREDIT_CARD">💳 Credit Card</option>
                  <option value="SAVINGS">🐖 Savings</option>
                  <option value="INVESTMENT">📈 Investment</option>
                </select>
              </div>

              {!editAccount && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Initial Balance</label>
                    <input type="number" step="0.01" className="form-input" placeholder="0.00"
                      value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="form-select" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="PLN">PLN</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {ACCOUNT_COLORS.map(color => (
                    <button key={color} type="button"
                      onClick={() => setForm({ ...form, color })}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', background: color, border: 'none', cursor: 'pointer',
                        outline: form.color === color ? `3px solid white` : 'none',
                        outlineOffset: 2, transition: 'all 0.15s'
                      }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editAccount ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
