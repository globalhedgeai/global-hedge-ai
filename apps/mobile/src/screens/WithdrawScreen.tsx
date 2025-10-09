// Withdraw Screen for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import ApiService from '../services/api';

interface WithdrawScreenProps {
  onBack: () => void;
}

const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT_TRC20');
  const [isLoading, setIsLoading] = useState(false);
  const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cryptoResponse, userResponse] = await Promise.all([
        ApiService.getCryptocurrencies(),
        ApiService.getUserProfile(),
      ]);

      if (cryptoResponse.ok) {
        setCryptocurrencies(cryptoResponse.cryptocurrencies);
      }

      if (userResponse.ok) {
        setUserBalance(userResponse.user.balance || 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('withdraw.error'), t('withdraw.invalidAmount'));
      return;
    }

    if (!address.trim()) {
      Alert.alert(t('withdraw.error'), t('withdraw.addressRequired'));
      return;
    }

    if (parseFloat(amount) > userBalance) {
      Alert.alert(t('withdraw.error'), t('withdraw.insufficientBalance'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.createWithdrawal({
        amount: parseFloat(amount),
        address: address.trim(),
        cryptocurrency: selectedCrypto,
      });

      if (response.ok) {
        Alert.alert(
          t('withdraw.success'),
          t('withdraw.successMessage'),
          [{ text: t('common.ok'), onPress: onBack }]
        );
      } else {
        Alert.alert(t('withdraw.error'), response.error || t('withdraw.errorMessage'));
      }
    } catch (error) {
      Alert.alert(t('withdraw.error'), t('withdraw.errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('withdraw.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('withdraw.availableBalance')}</Text>
          <Text style={styles.balanceAmount}>{userBalance.toFixed(2)} USDT</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('withdraw.amount')}</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder={t('withdraw.amountPlaceholder')}
            keyboardType="numeric"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('withdraw.cryptocurrency')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cryptocurrencies.map((crypto) => (
              <TouchableOpacity
                key={crypto.symbol}
                style={[
                  styles.cryptoOption,
                  selectedCrypto === crypto.symbol && styles.cryptoOptionSelected,
                ]}
                onPress={() => setSelectedCrypto(crypto.symbol)}
              >
                <Text style={styles.cryptoText}>{crypto.symbol}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('withdraw.walletAddress')}</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder={t('withdraw.addressPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
            multiline
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('withdraw.important')}</Text>
          <Text style={styles.infoText}>{t('withdraw.warning1')}</Text>
          <Text style={styles.infoText}>{t('withdraw.warning2')}</Text>
          <Text style={styles.infoText}>{t('withdraw.warning3')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.withdrawButton, isLoading && styles.withdrawButtonDisabled]}
          onPress={handleWithdraw}
          disabled={isLoading}
        >
          <Text style={styles.withdrawButtonText}>
            {isLoading ? t('withdraw.processing') : t('withdraw.confirmWithdraw')}
          </Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cryptoOption: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cryptoOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cryptoText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: COLORS.warningBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  withdrawButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  withdrawButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  withdrawButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WithdrawScreen;
