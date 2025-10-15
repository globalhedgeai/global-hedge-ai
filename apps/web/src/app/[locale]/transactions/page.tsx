'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/translations';
import AuthGuard from '@/components/AuthGuard';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'daily_reward' | 'random_reward';
  amount: number;
  status: string;
  createdAt: string;
  effectiveAt?: string;
  rewardAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  txId?: string;
  network?: string;
}

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals' | 'rewards'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.txId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'deposits' && transaction.type === 'deposit') ||
      (filter === 'withdrawals' && transaction.type === 'withdrawal') ||
      (filter === 'rewards' && (transaction.type === 'daily_reward' || transaction.type === 'random_reward'));
    
    const matchesDate = (!startDate || new Date(transaction.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(transaction.createdAt) <= new Date(endDate));
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'failed':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        );
      case 'withdrawal':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6H6m6 0h6" />
            </svg>
        );
      case 'daily_reward':
      case 'random_reward':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
        );
      default:
        return null;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Status', 'TX ID', 'Network'].join(','),
      ...sortedTransactions.map(tx => [
        formatDate(tx.createdAt),
        tx.type,
        formatAmount(tx.amount),
        tx.status,
        tx.txId || '',
        tx.network || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // PDF export functionality would go here
    console.log('PDF export not implemented yet');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setSortBy('date');
    setSortOrder('desc');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">{t('common.loading')}</span>
            </div>
          </div>
        </div>
      </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="card border-error/20 bg-error/5">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-error mb-2">{t('common.error')}</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={fetchTransactions}
                  className="btn-primary"
                >
                  {t('common.retry')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-muted-foreground to-gray-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">{t('transactions.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t('transactions.subtitle')}</p>
        </div>

        {/* Advanced Search and Filters */}
        <div className="mb-6 animate-fade-in">
          <div className="card">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('transactions.search')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('transactions.searchPlaceholder')}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                </div>
              </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('transactions.sortOrder')}</label>
                  <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="desc">{t('transactions.descending')}</option>
                      <option value="asc">{t('transactions.ascending')}</option>
                  </select>
                </div>

                {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('transactions.sortBy')}</label>
                  <select
                    value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'type')}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="date">{t('transactions.sortByDate')}</option>
                    <option value="amount">{t('transactions.sortByAmount')}</option>
                    <option value="type">{t('transactions.sortByType')}</option>
                  </select>
                </div>

                  {/* Filter By Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('transactions.filterByStatus')}</label>
                  <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as 'all' | 'deposits' | 'withdrawals' | 'rewards')}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="all">{t('transactions.allStatuses')}</option>
                      <option value="deposits">{t('transactions.deposit')}</option>
                      <option value="withdrawals">{t('transactions.withdrawal')}</option>
                      <option value="rewards">{t('transactions.reward')}</option>
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('transactions.startDate')}</label>
                  <input
                    type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t('transactions.endDate')}</label>
                  <input
                    type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error border border-error/20 rounded-lg hover:bg-error/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                    {t('transactions.exportPDF')}
                </button>
                <button
                  onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success border border-success/20 rounded-lg hover:bg-success/20 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('transactions.exportCSV')}
                </button>
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-muted/10 text-muted-foreground border border-muted/20 rounded-lg hover:bg-muted/20 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                    {t('transactions.clearFilters')}
                </button>
              </div>

              {/* Results Count */}
                <div className="mt-4 text-sm text-muted-foreground">
                  {t('transactions.showingResults')}: {sortedTransactions.length} {t('transactions.of')} {transactions.length}
                </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="animate-fade-in">
            {sortedTransactions.length === 0 ? (
            <div className="card">
                <div className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('transactions.noTransactions')}</h3>
                <p className="text-muted-foreground">{t('transactions.noTransactionsDesc')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
                {sortedTransactions.map((transaction) => (
                  <div key={transaction.id} className="card hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                            {getTypeIcon(transaction.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground capitalize">{transaction.type.replace('_', ' ')}</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-foreground">
                            {transaction.type.includes('reward') ? '+' : ''}{formatAmount(transaction.amount)} USDT
                          </div>
                          <div className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                            </div>
                        </div>
                      </div>

                      {transaction.txId && (
                        <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('transactions.txId')}:</span>
                            <span className="font-mono text-foreground">{transaction.txId}</span>
                          </div>
                          {transaction.network && (
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-muted-foreground">{t('transactions.network')}:</span>
                              <span className="text-foreground">{transaction.network}</span>
                            </div>
                          )}
                        </div>
                        )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
          {sortedTransactions.length > 0 && (
          <div className="mt-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                  <div className="p-4 text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {formatAmount(sortedTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <p className="text-muted-foreground">{t('transactions.totalDeposits')}</p>
              </div>
            </div>
            <div className="card">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-error mb-1">
                  {formatAmount(sortedTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <p className="text-muted-foreground">{t('transactions.totalWithdrawals')}</p>
              </div>
            </div>
            <div className="card">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {formatAmount(sortedTransactions.filter(t => t.type === 'daily_reward' || t.type === 'random_reward').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <p className="text-muted-foreground">{t('transactions.totalRewards')}</p>
              </div>
            </div>
            <div className="card">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {transactions.filter(t => t.type === 'daily_reward' || t.type === 'random_reward').length}
                </div>
                <p className="text-muted-foreground">{t('transactions.totalRewards')}</p>
              </div>
            </div>
          </div>
          </div>
        )}
        </div>
      </div>
    </AuthGuard>
  );
}