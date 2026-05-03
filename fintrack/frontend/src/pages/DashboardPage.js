import React, { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { transactionApi } from '../services/api';
import { format } from 'date-fns';

const formatCurrency = (val, currency = 'USD') => {
  if (val === undefined || val === null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(val);
};

const COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#14B8A6','#EC4899','#F97316'];

const TX_ICONS = {
  Salary: '💼', Freelance: '💻', Investment: '📈', Gift: '🎁',
  'Food & Dining': '🍽️', Transportation: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', 'Bills & Utilities': '⚡', Healthcare: '❤️',
  Education: '📚', Travel: '✈️'
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi.getDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen" style={{ background: 'transparent', height: 'auto', padding: 60 }}><div className="spinner" /></div>;
  if (!data) return null;

  // Process monthly trends data for chart
  const monthlyMap = {};
  (data.monthlyTrends || []).forEach(item => {
    const month = item.month ? item.month.substring(0, 7) : 'Unknown';
    if (!monthlyMap[month]) monthlyMap[month] = { month, income: 0, expenses: 0 };
    if (item.type === 'INCOME') monthlyMap[month].income = parseFloat(item.amount) || 0;
    if (item.type === 'EXPENSE') monthlyMap[month].expenses = parseFloat(item.amount) || 0;
  });
  const trendData = Object.values(monthlyMap).slice(-6);

  const pieData = (data.expensesByCategory || []).map((item, i) => ({
    name: item.category || 'Other',
    value: parseFloat(item.amount) || 0,
    color: COLORS[i % COLORS.length]
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card balance">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>💰</div>
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">{formatCurrency(data.totalBalance)}</div>
          <div className="stat-change">All accounts combined</div>
        </div>
        <div className="stat-card income">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>📈</div>
          <div className="stat-label">This Month Income</div>
          <div className="stat-value" style={{ color: 'var(--income-color)' }}>{formatCurrency(data.monthlyIncome)}</div>
          <div className="stat-change">Monthly earnings</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>📉</div>
          <div className="stat-label">This Month Expenses</div>
          <div className="stat-value" style={{ color: 'var(--expense-color)' }}>{formatCurrency(data.monthlyExpenses)}</div>
          <div className="stat-change">Monthly spending</div>
        </div>
        <div className="stat-card savings">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>🎯</div>
          <div className="stat-label">Net Savings</div>
          <div className="stat-value" style={{ color: data.netSavings >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
            {formatCurrency(data.netSavings)}
          </div>
          <div className="stat-change">Income minus expenses</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-title">Income vs Expenses (6 months)</div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1A2235', border: '1px solid #1E2D4A', borderRadius: 8, fontSize: 13 }} />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">📊</div>
              <p>No trend data yet. Add transactions to see your trends.</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Expenses by Category</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="40%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1A2235', border: '1px solid #1E2D4A', borderRadius: 8, fontSize: 13 }}
                  formatter={(val) => [formatCurrency(val), '']} />
                <Legend layout="vertical" align="right" verticalAlign="middle"
                  wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">🥧</div>
              <p>No expense data yet this month.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Recent Transactions</div>
          <a href="/transactions" style={{ fontSize: 13, color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
        </div>
        {data.recentTransactions?.length > 0 ? (
          <div className="transactions-list">
            {data.recentTransactions.map(tx => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{
                  background: tx.type === 'INCOME' ? 'rgba(16,185,129,0.1)' :
                    tx.type === 'EXPENSE' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)'
                }}>
                  {TX_ICONS[tx.categoryName] || (tx.type === 'INCOME' ? '💰' : tx.type === 'EXPENSE' ? '💸' : '🔄')}
                </div>
                <div className="tx-info">
                  <div className="tx-desc">{tx.description || tx.categoryName || tx.type}</div>
                  <div className="tx-meta">
                    {tx.categoryName && <span>{tx.categoryName} · </span>}
                    {tx.transactionDate ? format(new Date(tx.transactionDate), 'MMM d, yyyy') : ''}
                  </div>
                </div>
                <div className={`tx-amount ${tx.type.toLowerCase()}`}>
                  {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                  {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions yet</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Add your first transaction to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
