// Transactions Screen for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import ApiService from '../services/api';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'daily_reward' | 'random_reward';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  txId?: string;
  cryptocurrency?: string;
}

interface TransactionsScreenProps {
  onBack: () => void;
}

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'reward'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await ApiService.getTransactions();
      if (response.ok) {
        setTransactions(response.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'daily_reward':
        return '🎁';
      case 'random_reward':
        return '🎲';
      default:
        return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return COLORS.success;
      case 'withdrawal':
        return COLORS.error;
      case 'daily_reward':
      case 'random_reward':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'rejected':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'deposit') return transaction.type === 'deposit';
    if (filter === 'withdrawal') return transaction.type === 'withdrawal';
    if (filter === 'reward') return transaction.type === 'daily_reward' || transaction.type === 'random_reward';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('transactions.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: t('transactions.all') },
            { key: 'deposit', label: t('transactions.deposits') },
            { key: 'withdrawal', label: t('transactions.withdrawals') },
            { key: 'reward', label: t('transactions.rewards') },
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>{t('transactions.noTransactions')}</Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionIcon}>
                    {getTransactionIcon(transaction.type)}
                  </Text>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionType}>
                      {t(`transactions.${transaction.type}`)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.amountText,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {transaction.amount.toFixed(2)} USDT
                  </Text>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(transaction.status) },
                    ]}
                  >
                    {t(`transactions.status.${transaction.status}`)}
                  </Text>
                </View>
              </View>
              {transaction.txId && (
                <View style={styles.transactionFooter}>
                  <Text style={styles.txIdLabel}>{t('transactions.transactionId')}</Text>
                  <Text style={styles.txIdValue}>{transaction.txId}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  filters: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterButton: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  transactionDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  txIdLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  txIdValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

export default TransactionsScreen;
