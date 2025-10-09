import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslationService from '../services/translation';
import { API_CONFIG } from '../constants';

interface FinancialReport {
  totalDeposits: number;
  totalWithdrawals: number;
  totalRewards: number;
  netProfit: number;
  deposits: Array<{
    id: string;
    amount: number;
    createdAt: string;
    status: string;
  }>;
  withdrawals: Array<{
    id: string;
    amount: number;
    createdAt: string;
    status: string;
  }>;
}

interface ReportsScreenProps {
  onBack: () => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ onBack }) => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchReport();
  }, [timeframe]);

  const fetchReport = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/financial-reports?timeframe=${timeframe}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.ok) {
        setReport(data.report);
      } else {
        setError(data.error || TranslationService.t('errors.genericError'));
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(TranslationService.t('errors.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport(true);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#94A3B8';
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{TranslationService.t('reports.title')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>{TranslationService.t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{TranslationService.t('reports.title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchReport()}>
            <Text style={styles.retryButtonText}>{TranslationService.t('common.retry')}</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{TranslationService.t('reports.title')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          <TouchableOpacity
            style={[styles.timeframeButton, timeframe === 'week' && styles.timeframeButtonActive]}
            onPress={() => setTimeframe('week')}
          >
            <Text style={[styles.timeframeText, timeframe === 'week' && styles.timeframeTextActive]}>
              {TranslationService.t('reports.week')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeframeButton, timeframe === 'month' && styles.timeframeButtonActive]}
            onPress={() => setTimeframe('month')}
          >
            <Text style={[styles.timeframeText, timeframe === 'month' && styles.timeframeTextActive]}>
              {TranslationService.t('reports.month')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeframeButton, timeframe === 'year' && styles.timeframeButtonActive]}
            onPress={() => setTimeframe('year')}
          >
            <Text style={[styles.timeframeText, timeframe === 'year' && styles.timeframeTextActive]}>
              {TranslationService.t('reports.year')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryLabel}>{TranslationService.t('reports.totalDeposits')}</Text>
            <Text style={[styles.summaryValue, styles.depositValue]}>
              {formatCurrency(report?.totalDeposits || 0)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>💸</Text>
            <Text style={styles.summaryLabel}>{TranslationService.t('reports.totalWithdrawals')}</Text>
            <Text style={[styles.summaryValue, styles.withdrawalValue]}>
              {formatCurrency(report?.totalWithdrawals || 0)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🎁</Text>
            <Text style={styles.summaryLabel}>{TranslationService.t('reports.totalRewards')}</Text>
            <Text style={[styles.summaryValue, styles.rewardValue]}>
              {formatCurrency(report?.totalRewards || 0)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryLabel}>{TranslationService.t('reports.netProfit')}</Text>
            <Text style={[
              styles.summaryValue,
              (report?.netProfit || 0) >= 0 ? styles.profitPositive : styles.profitNegative
            ]}>
              {formatCurrency(report?.netProfit || 0)}
            </Text>
          </View>
        </View>

        {/* Recent Deposits */}
        {report && report.deposits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{TranslationService.t('reports.recentDeposits')}</Text>
            {report.deposits.map((deposit) => (
              <View key={deposit.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionAmount}>
                    +{formatCurrency(deposit.amount)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(deposit.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(deposit.status) }]}>
                      {deposit.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.transactionDate}>{formatDate(deposit.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Withdrawals */}
        {report && report.withdrawals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{TranslationService.t('reports.recentWithdrawals')}</Text>
            {report.withdrawals.map((withdrawal) => (
              <View key={withdrawal.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionAmount}>
                    -{formatCurrency(withdrawal.amount)}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(withdrawal.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(withdrawal.status) }]}>
                      {withdrawal.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.transactionDate}>{formatDate(withdrawal.createdAt)}</Text>
              </View>
            ))}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  timeframeText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  depositValue: {
    color: '#10B981',
  },
  withdrawalValue: {
    color: '#EF4444',
  },
  rewardValue: {
    color: '#F59E0B',
  },
  profitPositive: {
    color: '#10B981',
  },
  profitNegative: {
    color: '#EF4444',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default ReportsScreen;

