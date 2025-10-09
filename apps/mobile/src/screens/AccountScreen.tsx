import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslationService from '../services/translation';
import { API_CONFIG } from '../constants';
import { User } from '../types';

interface AccountScreenProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  onBack,
  onLogout,
  onUpdateUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(user.walletAddress || '');
  const [saving, setSaving] = useState(false);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSaveWalletAddress = async () => {
    if (!walletAddress.trim()) {
      Alert.alert(
        TranslationService.t('common.error'),
        TranslationService.t('account.walletAddressRequired')
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (data.ok) {
        Alert.alert(
          TranslationService.t('common.success'),
          TranslationService.t('account.profileUpdated')
        );
        onUpdateUser({ ...user, walletAddress });
      } else {
        Alert.alert(
          TranslationService.t('common.error'),
          data.error || TranslationService.t('account.updateError')
        );
      }
    } catch (err) {
      console.error('Error updating wallet address:', err);
      Alert.alert(
        TranslationService.t('common.error'),
        TranslationService.t('errors.networkError')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      TranslationService.t('auth.logout'),
      TranslationService.t('account.confirmLogout'),
      [
        {
          text: TranslationService.t('common.cancel'),
          style: 'cancel',
        },
        {
          text: TranslationService.t('auth.logout'),
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{TranslationService.t('account.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.email.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user.role === 'ADMIN' ? '👑 ' : ''}
              {user.role}
            </Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{TranslationService.t('account.balance')}</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(user.balance)}</Text>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceInfoText}>
              💰 {TranslationService.t('account.availableForWithdrawal')}
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {TranslationService.t('account.accountInformation')}
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{TranslationService.t('auth.email')}</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{TranslationService.t('account.role')}</Text>
              <Text style={styles.infoValue}>{user.role}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                {TranslationService.t('referrals.yourCode')}
              </Text>
              <Text style={[styles.infoValue, styles.referralCode]}>
                {user.referralCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Wallet Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {TranslationService.t('account.walletAddress')}
          </Text>

          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>
              {TranslationService.t('account.usdtWalletAddress')}
            </Text>
            <TextInput
              style={styles.walletInput}
              placeholder={TranslationService.t('account.walletAddressPlaceholder')}
              placeholderTextColor="#64748B"
              value={walletAddress}
              onChangeText={setWalletAddress}
              editable={!saving}
            />
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveWalletAddress}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {TranslationService.t('common.save')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TranslationService.t('common.actions')}</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🚪</Text>
              <Text style={styles.actionButtonText}>
                {TranslationService.t('auth.logout')}
              </Text>
            </View>
            <Text style={styles.actionButtonArrow}>→</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#3B82F6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  balanceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
  },
  balanceInfo: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
  },
  balanceInfoText: {
    fontSize: 12,
    color: '#94A3B8',
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
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#F1F5F9',
    fontWeight: '600',
  },
  referralCode: {
    color: '#3B82F6',
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
  },
  walletCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  walletLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  walletInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#F1F5F9',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#1E3A5F',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  actionButtonArrow: {
    fontSize: 20,
    color: '#EF4444',
  },
});

export default AccountScreen;

