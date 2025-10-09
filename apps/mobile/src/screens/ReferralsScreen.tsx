import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import TranslationService from '../services/translation';
import { API_CONFIG } from '../constants';

interface InvitedUser {
  id: string;
  email: string;
  joinedAt: string;
  hasDeposited: boolean;
  firstDepositAt: string | null;
  totalDeposits: number;
}

interface ReferralStats {
  referralCode: string;
  totalInvited: number;
  successfulReferrals: number;
  totalEarnings: number;
  tier: number;
  profitRate: number;
  invitedUsers: InvitedUser[];
}

interface ReferralsScreenProps {
  onBack: () => void;
}

const ReferralsScreen: React.FC<ReferralsScreenProps> = ({ onBack }) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/referrals/stats`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.ok) {
        setStats(data.stats);
      } else {
        setError(data.error || TranslationService.t('errors.generic'));
      }
    } catch (err) {
      console.error('Error fetching referral stats:', err);
      setError(TranslationService.t('errors.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReferralStats(true);
  };

  const shareReferralCode = async () => {
    if (!stats?.referralCode) return;

    const referralUrl = `${API_CONFIG.BASE_URL}/register?ref=${stats.referralCode}`;
    const message = TranslationService.t('referrals.shareMessage', { code: stats.referralCode, url: referralUrl });

    try {
      await Share.share({
        message,
        url: referralUrl,
      });
    } catch (err) {
      console.error('Error sharing referral code:', err);
    }
  };

  const getProfitRate = (successfulReferrals: number) => {
    if (successfulReferrals >= 10) return '35%';
    if (successfulReferrals >= 5) return '30%';
    return '25%';
  };

  const getNextTierInfo = (successfulReferrals: number) => {
    if (successfulReferrals < 5) {
      return {
        needed: 5 - successfulReferrals,
        nextRate: '30%',
      };
    } else if (successfulReferrals < 10) {
      return {
        needed: 10 - successfulReferrals,
        nextRate: '35%',
      };
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{TranslationService.t('referrals.title')}</Text>
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
          <Text style={styles.headerTitle}>{TranslationService.t('referrals.title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchReferralStats()}>
            <Text style={styles.retryButtonText}>{TranslationService.t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nextTier = getNextTierInfo(stats?.successfulReferrals || 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{TranslationService.t('referrals.title')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Referral Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{TranslationService.t('referrals.yourCode')}</Text>
          <Text style={styles.codeText}>{stats?.referralCode || 'N/A'}</Text>
          
          {/* QR Code */}
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              {stats?.referralCode && (
                <QRCode
                  value={`${API_CONFIG.BASE_URL}/register?ref=${stats.referralCode}`}
                  size={150}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={shareReferralCode}>
            <Text style={styles.shareButtonText}>📤 {TranslationService.t('referrals.share')}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{TranslationService.t('referrals.totalInvited')}</Text>
            <Text style={styles.statValue}>{stats?.totalInvited || 0}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{TranslationService.t('referrals.successfulReferrals')}</Text>
            <Text style={[styles.statValue, styles.successValue]}>{stats?.successfulReferrals || 0}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{TranslationService.t('referrals.currentProfitRate')}</Text>
            <Text style={[styles.statValue, styles.profitValue]}>
              {getProfitRate(stats?.successfulReferrals || 0)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{TranslationService.t('referrals.totalEarnings')}</Text>
            <Text style={[styles.statValue, styles.earningsValue]}>
              {formatCurrency(stats?.totalEarnings || 0)}
            </Text>
          </View>
        </View>

        {/* Tier Progress */}
        {nextTier && (
          <View style={styles.tierCard}>
            <Text style={styles.tierTitle}>🎯 {TranslationService.t('referrals.nextTier')}</Text>
            <Text style={styles.tierDescription}>
              {TranslationService.t('referrals.inviteMore', { 
                count: nextTier.needed, 
                rate: nextTier.nextRate 
              })}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((stats?.successfulReferrals || 0) / (stats?.successfulReferrals || 0) + nextTier.needed) * 100}%` 
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Profit Rates Info */}
        <View style={styles.ratesCard}>
          <Text style={styles.ratesTitle}>📊 {TranslationService.t('referrals.profitRates')}</Text>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>• {TranslationService.t('referrals.baseRate')}</Text>
            <Text style={styles.rateValue}>25%</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>• {TranslationService.t('referrals.tier1Rate')} (5 {TranslationService.t('referrals.depositors')})</Text>
            <Text style={[styles.rateValue, styles.tier1]}>30%</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>• {TranslationService.t('referrals.tier2Rate')} (10 {TranslationService.t('referrals.depositors')})</Text>
            <Text style={[styles.rateValue, styles.tier2]}>35%</Text>
          </View>
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              ⚠️ {TranslationService.t('referrals.depositRequirement')}
            </Text>
          </View>
        </View>

        {/* Invited Users List */}
        <View style={styles.usersCard}>
          <Text style={styles.usersTitle}>{TranslationService.t('referrals.invitedUsers')}</Text>
          
          {!stats?.invitedUsers || stats.invitedUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{TranslationService.t('referrals.noInvites')}</Text>
            </View>
          ) : (
            <View style={styles.usersList}>
              {stats.invitedUsers.map((user) => (
                <View
                  key={user.id}
                  style={[
                    styles.userCard,
                    user.hasDeposited ? styles.userCardActive : styles.userCardPending,
                  ]}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userDate}>
                      {TranslationService.t('referrals.joined')}: {new Date(user.joinedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.userStatus}>
                    <View style={[
                      styles.statusBadge,
                      user.hasDeposited ? styles.statusActive : styles.statusPending,
                    ]}>
                      <Text style={styles.statusText}>
                        {user.hasDeposited ? '✓ ' + TranslationService.t('referrals.active') : '⏳ ' + TranslationService.t('referrals.pending')}
                      </Text>
                    </View>
                    {user.hasDeposited && (
                      <Text style={styles.depositsCount}>
                        {user.totalDeposits} {TranslationService.t('referrals.deposits')}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
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
  codeCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  codeLabel: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 20,
  },
  qrContainer: {
    marginBottom: 20,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  shareButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  successValue: {
    color: '#10B981',
  },
  profitValue: {
    color: '#F59E0B',
  },
  earningsValue: {
    color: '#3B82F6',
  },
  tierCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  ratesCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  ratesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rateLabel: {
    fontSize: 14,
    color: '#94A3B8',
    flex: 1,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  tier1: {
    color: '#F59E0B',
  },
  tier2: {
    color: '#10B981',
  },
  noteContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  noteText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  usersCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  userCardActive: {
    backgroundColor: '#0F3D2C',
    borderColor: '#10B981',
  },
  userCardPending: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  userInfo: {
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  userStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  depositsCount: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});

export default ReferralsScreen;

