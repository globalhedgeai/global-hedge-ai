// Home Screen for Global Hedge AI Mobile App - Enhanced Design

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, DailyReward, RandomReward } from '../types';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import ApiService from '../services/api';
import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  user: User;
  onNavigateToDeposit: () => void;
  onNavigateToWithdraw: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToMessages: () => void;
  onNavigateToSettings: () => void;
  onNavigateToMarket: () => void;
  onNavigateToReferrals: () => void;
  onNavigateToAccount: () => void;
  onNavigateToReports: () => void;
  onNavigateToInfo: () => void;
  onNavigateToAdmin: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onNavigateToDeposit,
  onNavigateToWithdraw,
  onNavigateToTransactions,
  onNavigateToMessages,
  onNavigateToSettings,
  onNavigateToMarket,
  onNavigateToReferrals,
  onNavigateToAccount,
  onNavigateToReports,
  onNavigateToInfo,
  onNavigateToAdmin,
}) => {
  const { t } = useTranslation();
  const [dailyReward, setDailyReward] = useState<DailyReward | null>(null);
  const [randomReward, setRandomReward] = useState<RandomReward | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const [dailyResponse, randomResponse] = await Promise.all([
        ApiService.getDailyReward(),
        ApiService.getRandomReward(),
      ]);

      if (dailyResponse.ok) {
        setDailyReward(dailyResponse.data!);
      }

      if (randomResponse.ok) {
        setRandomReward(randomResponse.data!);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRewards();
    setIsRefreshing(false);
  };

  const claimDailyReward = async () => {
    try {
      const response = await ApiService.claimDailyReward();
      if (response.ok) {
        Alert.alert('نجح!', 'تم المطالبة بالمكافأة اليومية بنجاح');
        loadRewards();
      } else {
        Alert.alert('خطأ', response.error || 'فشل في المطالبة بالمكافأة');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    }
  };

  const claimRandomReward = async () => {
    try {
      const response = await ApiService.claimRandomReward();
      if (response.ok) {
        Alert.alert('نجح!', 'تم المطالبة بالمكافأة العشوائية بنجاح');
        loadRewards();
      } else {
        Alert.alert('خطأ', response.error || 'فشل في المطالبة بالمكافأة');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>مرحباً،</Text>
            <Text style={styles.userName}>{user.email}</Text>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>متصل</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={onNavigateToSettings}>
            <Text style={styles.profileIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>{t('home.currentBalance')}</Text>
            <TouchableOpacity style={styles.refreshButton}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{user.balance.toFixed(2)}</Text>
          <Text style={styles.balanceCurrency}>USDT</Text>
          <Text style={styles.balanceSubtext}>{t('home.balanceAvailable')}</Text>
          
          {/* Balance Actions */}
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.balanceActionButton} onPress={onNavigateToDeposit}>
              <Text style={styles.balanceActionIcon}>📈</Text>
              <Text style={styles.balanceActionText}>إيداع</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.balanceActionButton} onPress={onNavigateToWithdraw}>
              <Text style={styles.balanceActionIcon}>📉</Text>
              <Text style={styles.balanceActionText}>سحب</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToDeposit}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>💰</Text>
              </View>
              <Text style={styles.actionText}>{t('home.deposit')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToWithdraw}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>💸</Text>
              </View>
              <Text style={styles.actionText}>{t('home.withdraw')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToTransactions}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📊</Text>
              </View>
              <Text style={styles.actionText}>{t('home.transactions')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToMessages}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>💬</Text>
              </View>
              <Text style={styles.actionText}>{t('home.messages')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToMarket}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📈</Text>
              </View>
              <Text style={styles.actionText}>{t('home.market')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReferrals}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>👥</Text>
              </View>
              <Text style={styles.actionText}>{t('home.referrals')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToAccount}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>👤</Text>
              </View>
              <Text style={styles.actionText}>{t('home.account')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReports}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📋</Text>
              </View>
              <Text style={styles.actionText}>{t('home.reports')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToInfo}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>ℹ️</Text>
              </View>
              <Text style={styles.actionText}>{t('home.info')}</Text>
            </TouchableOpacity>
            
            {user.role === 'ADMIN' && (
              <TouchableOpacity style={styles.actionButton} onPress={onNavigateToAdmin}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>👑</Text>
                </View>
                <Text style={styles.actionText}>{t('home.admin')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Enhanced Rewards Section */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>{t('home.rewards')}</Text>
          
          {/* Daily Reward */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <View style={styles.rewardTitleContainer}>
                <Text style={styles.rewardTitle}>المكافأة اليومية</Text>
                <Text style={styles.rewardSubtitle}>مكافأة يومية مجانية</Text>
              </View>
              <View style={styles.rewardAmountContainer}>
                <Text style={styles.rewardAmount}>+{dailyReward?.amount || 0}</Text>
                <Text style={styles.rewardCurrency}>USDT</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.claimButton,
                dailyReward?.claimed && styles.claimButtonDisabled
              ]}
              onPress={claimDailyReward}
              disabled={dailyReward?.claimed}
            >
              <Text style={[
                styles.claimButtonText,
                dailyReward?.claimed && styles.claimButtonTextDisabled
              ]}>
                {dailyReward?.claimed ? 'تم المطالبة' : 'مطالبة الآن'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Random Reward */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <View style={styles.rewardTitleContainer}>
                <Text style={styles.rewardTitle}>المكافأة العشوائية</Text>
                <Text style={styles.rewardSubtitle}>مكافأة عشوائية تصل إلى 2 USDT</Text>
              </View>
              <View style={styles.rewardAmountContainer}>
                <Text style={styles.rewardAmount}>+{randomReward?.amount || 0}</Text>
                <Text style={styles.rewardCurrency}>USDT</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.claimButton,
                randomReward?.claimed && styles.claimButtonDisabled
              ]}
              onPress={claimRandomReward}
              disabled={randomReward?.claimed}
            >
              <Text style={[
                styles.claimButtonText,
                randomReward?.claimed && styles.claimButtonTextDisabled
              ]}>
                {randomReward?.claimed ? 'تم المطالبة' : 'مطالبة الآن'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Referral Section */}
        <View style={styles.referralSection}>
          <Text style={styles.sectionTitle}>كود الدعوة</Text>
          <View style={styles.referralCard}>
            <View style={styles.referralCodeContainer}>
              <Text style={styles.referralCode}>{user.referralCode}</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyIcon}>📋</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.referralDescription}>
              شارك كود الدعوة مع أصدقائك واحصل على مكافآت إضافية
            </Text>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>مشاركة الكود</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  profileIcon: {
    fontSize: 20,
    color: COLORS.background,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.9,
    fontWeight: '500',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 16,
    color: COLORS.background,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.9,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  balanceSubtext: {
    fontSize: 12,
    color: COLORS.background,
    opacity: 0.8,
    marginBottom: SPACING.lg,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  balanceActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  balanceActionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  balanceActionText: {
    fontSize: 14,
    color: COLORS.background,
    fontWeight: '600',
  },
  quickActions: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionIcon: {
    fontSize: 24,
    color: COLORS.background,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  rewardsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  rewardCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rewardTitleContainer: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  rewardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  rewardAmountContainer: {
    alignItems: 'flex-end',
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  rewardCurrency: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  claimButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  claimButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  claimButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  referralSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  referralCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  copyButton: {
    padding: SPACING.sm,
  },
  copyIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  referralDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HomeScreen;
