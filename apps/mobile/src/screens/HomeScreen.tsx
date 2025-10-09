// Home Screen for Global Hedge AI Mobile App

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
import { User, DailyReward, RandomReward } from '../types';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import ApiService from '../services/api';
import { useTranslation } from '../hooks/useTranslation';

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
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحباً،</Text>
            <Text style={styles.userName}>{user.email}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={onNavigateToSettings}>
            <Text style={styles.profileIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('home.currentBalance')}</Text>
          <Text style={styles.balanceAmount}>{user.balance.toFixed(2)} USDT</Text>
          <Text style={styles.balanceSubtext}>{t('home.balanceAvailable')}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToDeposit}>
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>{t('home.deposit')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToWithdraw}>
              <Text style={styles.actionIcon}>💸</Text>
              <Text style={styles.actionText}>{t('home.withdraw')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToTransactions}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>{t('home.transactions')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToMessages}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{t('home.messages')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToMarket}>
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionText}>{t('home.market')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReferrals}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionText}>{t('home.referrals')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToAccount}>
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionText}>{t('home.account')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReports}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>{t('home.reports')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={onNavigateToInfo}>
              <Text style={styles.actionIcon}>ℹ️</Text>
              <Text style={styles.actionText}>{t('home.info')}</Text>
            </TouchableOpacity>
            
            {user.role === 'ADMIN' && (
              <TouchableOpacity style={styles.actionButton} onPress={onNavigateToAdmin}>
                <Text style={styles.actionIcon}>👑</Text>
                <Text style={styles.actionText}>{t('home.admin')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Rewards Section */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>{t('home.rewards')}</Text>
          
          {/* Daily Reward */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardTitle}>المكافأة اليومية</Text>
              <Text style={styles.rewardAmount}>+{dailyReward?.amount || 0} USDT</Text>
            </View>
            <Text style={styles.rewardDescription}>
              احصل على مكافأة يومية مجانية
            </Text>
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
              <Text style={styles.rewardTitle}>المكافأة العشوائية</Text>
              <Text style={styles.rewardAmount}>+{randomReward?.amount || 0} USDT</Text>
            </View>
            <Text style={styles.rewardDescription}>
              مكافأة عشوائية تصل إلى 2 USDT
            </Text>
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

        {/* Referral Section */}
        <View style={styles.referralSection}>
          <Text style={styles.sectionTitle}>كود الدعوة</Text>
          <View style={styles.referralCard}>
            <Text style={styles.referralCode}>{user.referralCode}</Text>
            <Text style={styles.referralDescription}>
              شارك كود الدعوة مع أصدقائك واحصل على مكافآت إضافية
            </Text>
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
    paddingVertical: SPACING.md,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.background,
    marginVertical: SPACING.sm,
  },
  balanceSubtext: {
    fontSize: 12,
    color: COLORS.background,
    opacity: 0.8,
  },
  quickActions: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  rewardsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  rewardCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  rewardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  claimButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  claimButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  claimButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
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
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  referralDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen;
