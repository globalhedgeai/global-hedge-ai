import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslationService from '../services/translation';
import ApiService from '../services/api';

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  cryptocurrency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  txId?: string;
}

interface AdminTransactionsScreenProps {
  onBack: () => void;
  type: 'deposits' | 'withdrawals';
}

const AdminTransactionsScreen: React.FC<AdminTransactionsScreenProps> = ({ onBack, type }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = type === 'deposits' 
        ? await ApiService.getAdminDeposits()
        : await ApiService.getAdminWithdrawals();
      
      if (response.ok) {
        setTransactions(response.data || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const approveTransaction = async (transactionId: string) => {
    try {
      const response = type === 'deposits'
        ? await ApiService.approveDeposit(transactionId)
        : await ApiService.approveWithdrawal(transactionId);
      
      if (response.ok) {
        setTransactions(transactions.map(t => 
          t.id === transactionId ? { ...t, status: 'APPROVED' } : t
        ));
        Alert.alert('Success', `${type === 'deposits' ? 'Deposit' : 'Withdrawal'} approved successfully!`);
        await loadTransactions(); // Refresh to get updated data
      } else {
        Alert.alert('Error', `Failed to approve ${type === 'deposits' ? 'deposit' : 'withdrawal'}`);
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      Alert.alert('Error', `Failed to approve ${type === 'deposits' ? 'deposit' : 'withdrawal'}`);
    }
  };

  const rejectTransaction = async (transactionId: string) => {
    try {
      const response = type === 'deposits'
        ? await ApiService.rejectDeposit(transactionId)
        : await ApiService.rejectWithdrawal(transactionId);
      
      if (response.ok) {
        setTransactions(transactions.map(t => 
          t.id === transactionId ? { ...t, status: 'REJECTED' } : t
        ));
        Alert.alert('Success', `${type === 'deposits' ? 'Deposit' : 'Withdrawal'} rejected successfully!`);
      } else {
        Alert.alert('Error', `Failed to reject ${type === 'deposits' ? 'deposit' : 'withdrawal'}`);
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      Alert.alert('Error', `Failed to reject ${type === 'deposits' ? 'deposit' : 'withdrawal'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      case 'PENDING': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'PENDING': return '⏳';
      default: return '❓';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.status === filter.toUpperCase();
  });

  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {type === 'deposits' ? 'Deposit Requests' : 'Withdrawal Requests'}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === 'deposits' ? 'Deposit Requests' : 'Withdrawal Requests'}
        </Text>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingCount}>{pendingCount}</Text>
          </View>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterButton,
                filter === filterOption.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterOption.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterOption.key && styles.filterButtonTextActive,
                ]}
              >
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionId}>ID: {transaction.id.slice(-8)}</Text>
                <Text style={styles.userId}>User: {transaction.userId.slice(-8)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                <Text style={styles.statusIcon}>{getStatusIcon(transaction.status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                  {transaction.status}
                </Text>
              </View>
            </View>

            <View style={styles.transactionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>{formatCurrency(transaction.amount)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cryptocurrency:</Text>
                <Text style={styles.detailValue}>{transaction.cryptocurrency}</Text>
              </View>

              {transaction.txId && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID:</Text>
                  <Text style={styles.detailValue}>{transaction.txId.slice(0, 16)}...</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>{formatDate(transaction.createdAt)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Updated:</Text>
                <Text style={styles.detailValue}>{formatDate(transaction.updatedAt)}</Text>
              </View>
            </View>

            {transaction.status === 'PENDING' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => approveTransaction(transaction.id)}
                >
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => rejectTransaction(transaction.id)}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {type === 'deposits' ? '💰' : '💸'}
            </Text>
            <Text style={styles.emptyText}>
              No {type === 'deposits' ? 'deposits' : 'withdrawals'} found
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  backButtonText: {
    fontSize: 24,
    color: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginLeft: 12,
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pendingCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  transactionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  userId: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#F1F5F9',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default AdminTransactionsScreen;
