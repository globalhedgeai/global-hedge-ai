// Deposit Screen for Global Hedge AI Mobile App

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

interface DepositScreenProps {
  onBack: () => void;
}

const DepositScreen: React.FC<DepositScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT_TRC20');
  const [isLoading, setIsLoading] = useState(false);
  const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([]);

  useEffect(() => {
    loadCryptocurrencies();
  }, []);

  const loadCryptocurrencies = async () => {
    try {
      const response = await ApiService.getCryptocurrencies();
      if (response.ok) {
        setCryptocurrencies(response.cryptocurrencies);
      }
    } catch (error) {
      console.error('Error loading cryptocurrencies:', error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('deposit.error'), t('deposit.invalidAmount'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.createDeposit({
        amount: parseFloat(amount),
        cryptocurrency: selectedCrypto,
      });

      if (response.ok) {
        Alert.alert(
          t('deposit.success'),
          t('deposit.successMessage'),
          [{ text: t('common.ok'), onPress: onBack }]
        );
      } else {
        Alert.alert(t('deposit.error'), response.error || t('deposit.errorMessage'));
      }
    } catch (error) {
      Alert.alert(t('deposit.error'), t('deposit.errorMessage'));
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
        <Text style={styles.title}>{t('deposit.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('deposit.amount')}</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder={t('deposit.amountPlaceholder')}
            keyboardType="numeric"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('deposit.cryptocurrency')}</Text>
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
          <Text style={styles.cardTitle}>{t('deposit.walletAddress')}</Text>
          <Text style={styles.walletAddress}>
            {cryptocurrencies.find(c => c.symbol === selectedCrypto)?.address || ''}
          </Text>
          <TouchableOpacity style={styles.copyButton}>
            <Text style={styles.copyButtonText}>{t('deposit.copyAddress')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.depositButton, isLoading && styles.depositButtonDisabled]}
          onPress={handleDeposit}
          disabled={isLoading}
        >
          <Text style={styles.depositButtonText}>
            {isLoading ? t('deposit.processing') : t('deposit.confirmDeposit')}
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
  walletAddress: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  copyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  copyButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  depositButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  depositButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  depositButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DepositScreen;
