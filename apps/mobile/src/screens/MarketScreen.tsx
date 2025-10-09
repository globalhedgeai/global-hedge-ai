import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslationService from '../services/translation';
import { API_CONFIG } from '../constants';

interface MarketPair {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

interface MarketScreenProps {
  onBack: () => void;
}

const MarketScreen: React.FC<MarketScreenProps> = ({ onBack }) => {
  const [pairs, setPairs] = useState<MarketPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<MarketPair | null>(null);

  useEffect(() => {
    fetchMarketData();
    
    // تحديث البيانات كل 10 ثواني
    const interval = setInterval(() => {
      fetchMarketData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/market`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.ok && data.pairs) {
        setPairs(data.pairs);
        if (!selectedPair && data.pairs.length > 0) {
          setSelectedPair(data.pairs[0]);
        }
      } else {
        setError(data.error || TranslationService.t('errors.generic'));
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(TranslationService.t('errors.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketData();
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const renderPairItem = ({ item }: { item: MarketPair }) => {
    const isPositive = item.change24h >= 0;
    const isSelected = selectedPair?.symbol === item.symbol;

    return (
      <TouchableOpacity
        style={[
          styles.pairCard,
          isSelected && styles.pairCardSelected,
        ]}
        onPress={() => setSelectedPair(item)}
      >
        <View style={styles.pairHeader}>
          <Text style={styles.pairSymbol}>{item.symbol}</Text>
          <Text style={[
            styles.pairChange,
            isPositive ? styles.positiveChange : styles.negativeChange,
          ]}>
            {formatPercentage(item.change24h)}
          </Text>
        </View>
        <View style={styles.pairDetails}>
          <Text style={styles.pairPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.pairVolume}>
            {TranslationService.t('market.volume')}: {formatVolume(item.volume24h)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{TranslationService.t('market.title')}</Text>
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
          <Text style={styles.headerTitle}>{TranslationService.t('market.title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchMarketData()}>
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
        <Text style={styles.headerTitle}>{TranslationService.t('market.title')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Selected Pair Details */}
        {selectedPair && (
          <View style={styles.selectedPairCard}>
            <Text style={styles.selectedPairSymbol}>{selectedPair.symbol}</Text>
            <Text style={styles.selectedPairPrice}>{formatPrice(selectedPair.price)}</Text>
            <View style={styles.selectedPairStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{TranslationService.t('market.change24h')}</Text>
                <Text style={[
                  styles.statValue,
                  selectedPair.change24h >= 0 ? styles.positiveChange : styles.negativeChange,
                ]}>
                  {formatPercentage(selectedPair.change24h)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{TranslationService.t('market.high24h')}</Text>
                <Text style={styles.statValue}>{formatPrice(selectedPair.high24h)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{TranslationService.t('market.low24h')}</Text>
                <Text style={styles.statValue}>{formatPrice(selectedPair.low24h)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{TranslationService.t('market.volume24h')}</Text>
                <Text style={styles.statValue}>{formatVolume(selectedPair.volume24h)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Market Pairs List */}
        <View style={styles.pairsSection}>
          <Text style={styles.sectionTitle}>{TranslationService.t('market.allPairs')}</Text>
          {pairs.map((pair) => (
            <View key={pair.symbol}>
              {renderPairItem({ item: pair })}
            </View>
          ))}
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
  },
  selectedPairCard: {
    backgroundColor: '#1E293B',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  selectedPairSymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  selectedPairPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 16,
  },
  selectedPairStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  pairsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 12,
  },
  pairCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pairCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A5F',
  },
  pairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pairSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  pairChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  pairDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pairPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  pairVolume: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default MarketScreen;

