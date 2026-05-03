import React, { useState, useEffect, useCallback } from 'react';
import { transactionApi, categoryApi, accountApi } from '../services/api';
import { format } from 'date-fns';

const formatCurrency = (val) => {
  if (!val && val !== 0) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);
};

const TX_ICONS = {
  Salary: '💼', Freelance: '💻', Investment: '📈', Gift: '🎁',
  'Food & Dining': '🍽️', Transportation: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', 'Bills & Utilities': '⚡', Healthcare: '❤️',
  Education: '📚', Travel: '✈️'
};

const defaultForm = {
  amount: '', type: 'EXPENSE', description: '', note: '',
  transactionDate: new Date().toISOString().slice(0, 16),
  accountId: '', categoryId: '', toAccountId: ''
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ type: '', categoryId: '', accountId: '' });
  const [pagination, setPagination] = useState({ totalPages: 0, totalElements: 0, currentPage: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 50 };
      if (filters.type) params.type = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.accountId) params.accountId = filters.accountId;

      const [txRes, catRes, accRes] = await Promise.all([
        transactionApi.getAll(params),
        categoryApi.getAll(),
        accountApi.getAll()
      ]);
      setTransactions(txRes.data.content || []);
      setPagination({ totalPages: txRes.data.totalPages, totalElements: txRes.data.totalElements, currentPage: 0 });
      setCategories(catRes.data || []);
      setAccounts(accRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditTx(null);
    setForm({ ...defaultForm, accountId: accounts[0]?.id?.toString() || '' });
    setShowModal(true);
  };

  const openEdit = (tx) => {
    setEditTx(tx);
    setForm({
      amount: tx.amount?.toString() || '',
      type: tx.type || 'EXPENSE',
      description: tx.description || '',
      note: tx.note || '',
      transactionDate: tx.transactionDate ? tx.transactionDate.slice(0, 16) : defaultForm.transactionDate,
      accountId: tx.accountId?.toString() || '',
      categoryId: tx.categoryId?.toString() || '',
      toAccountId: ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        type: form.type,
        description: form.description,
        note: form.note,
        transactionDate: form.transactionDate ? new Date(form.transactionDate).toISOString() : null,
        accountId: form.accountId ? parseInt(form.accountId) : null,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        toAccountId: form.toAccountId ? parseInt(form.toAccountId) : null,
      };
      if (editTx) {
        await transactionApi.update(editTx.id, payload);
      } else {
        await transactionApi.create(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (e) { alert(e.response?.data?.error || 'Error saving transaction'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionApi.delete(id);
      fetchData();
    } catch (e) { alert('Error deleting transaction'); }
  };

  const filteredCats = categories.filter(c => !form.type || c.type === form.type);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{pagination.totalElements} total transactions</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <select className="form-select" value={filters.type}
          onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
          <option value="TRANSFER">Transfer</option>
        </select>
        <select className="form-select" value={filters.categoryId}
          onChange={e => setFilters({ ...filters, categoryId: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="form-select" value={filters.accountId}
          onChange={e => setFilters({ ...filters, accountId: e.target.value })}>
          <option value="">All Accounts</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {(filters.type || filters.categoryId || filters.accountId) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ type: '', categoryId: '', accountId: '' })}>
            Clear
          </button>
        )}
      </div>

      {/* Transactions List */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions found</div>
            <p style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 14 }}>Add your first transaction to track your finances</p>
            <button className="btn btn-primary" onClick={openCreate}>Add Transaction</button>
          </div>
        ) : (
          <div className="transactions-list" style={{ padding: '8px 0' }}>
            {transactions.map(tx => (
              <div key={tx.id} className="tx-item" style={{ padding: '14px 20px' }}>
                <div className="tx-icon" style={{
                  background: tx.type === 'INCOME' ? 'rgba(16,185,129,0.1)' :
                    tx.type === 'EXPENSE' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                  fontSize: 20
                }}>
                  {TX_ICONS[tx.categoryName] || (tx.type === 'INCOME' ? '💰' : tx.type === 'EXPENSE' ? '💸' : '🔄')}
                </div>
                <div className="tx-info">
                  <div className="tx-desc">{tx.description || tx.categoryName || 'Transaction'}</div>
                  <div className="tx-meta" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span>
                    {tx.categoryName && <span>{tx.categoryName}</span>}
                    {tx.accountName && <span>• {tx.accountName}</span>}
                    <span>• {tx.transactionDate ? format(new Date(tx.transactionDate), 'MMM d, yyyy') : ''}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`tx-amount ${tx.type.toLowerCase()}`}>
                    {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                    {formatCurrency(tx.amount)}
                  </div>
                  <button className="btn-icon" onClick={() => openEdit(tx)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(tx.id)} title="Delete" style={{ color: 'var(--expense-color)' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editTx ? 'Edit Transaction' : 'New Transaction'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {/* Type selector */}
              <div className="form-group">
                <label className="form-label">Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['INCOME', 'EXPENSE', 'TRANSFER'].map(t => (
                    <button key={t} type="button"
                      className={`btn ${form.type === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setForm({ ...form, type: t, categoryId: '' })}
                      style={{ flex: 1, justifyContent: 'center' }}>
                      {t === 'INCOME' ? '📈 Income' : t === 'EXPENSE' ? '📉 Expense' : '🔄 Transfer'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="datetime-local" className="form-input"
                    value={form.transactionDate} onChange={e => setForm({ ...form, transactionDate: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" className="form-input" placeholder="What was this transaction for?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Account</label>
                  <select className="form-select" value={form.accountId}
                    onChange={e => setForm({ ...form, accountId: e.target.value })}>
                    <option value="">Select account</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select category</option>
                    {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {form.type === 'TRANSFER' && (
                <div className="form-group">
                  <label className="form-label">To Account</label>
                  <select className="form-select" value={form.toAccountId}
                    onChange={e => setForm({ ...form, toAccountId: e.target.value })}>
                    <option value="">Select destination account</option>
                    {accounts.filter(a => a.id.toString() !== form.accountId).map(a =>
                      <option key={a.id} value={a.id}>{a.name}</option>
                    )}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <textarea className="form-input" rows={2} placeholder="Additional notes..."
                  value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                  style={{ resize: 'vertical', minHeight: 60 }} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editTx ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
