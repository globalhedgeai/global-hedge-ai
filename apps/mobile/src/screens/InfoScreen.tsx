import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslationService from '../services/translation';

interface InfoScreenProps {
  onBack: () => void;
}

const InfoScreen: React.FC<InfoScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{TranslationService.t('info.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>🌍</Text>
          <Text style={styles.heroTitle}>Global Hedge AI</Text>
          <Text style={styles.heroSubtitle}>
            {TranslationService.t('info.subtitle')}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TranslationService.t('info.features')}</Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureTitle}>{TranslationService.t('info.secureTitle')}</Text>
            <Text style={styles.featureDescription}>
              {TranslationService.t('info.secureDescription')}
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>{TranslationService.t('info.fastTitle')}</Text>
            <Text style={styles.featureDescription}>
              {TranslationService.t('info.fastDescription')}
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎁</Text>
            <Text style={styles.featureTitle}>{TranslationService.t('info.rewardsTitle')}</Text>
            <Text style={styles.featureDescription}>
              {TranslationService.t('info.rewardsDescription')}
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>{TranslationService.t('info.referralTitle')}</Text>
            <Text style={styles.featureDescription}>
              {TranslationService.t('info.referralDescription')}
            </Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TranslationService.t('info.howItWorks')}</Text>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{TranslationService.t('info.step1Title')}</Text>
              <Text style={styles.stepDescription}>
                {TranslationService.t('info.step1Description')}
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{TranslationService.t('info.step2Title')}</Text>
              <Text style={styles.stepDescription}>
                {TranslationService.t('info.step2Description')}
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{TranslationService.t('info.step3Title')}</Text>
              <Text style={styles.stepDescription}>
                {TranslationService.t('info.step3Description')}
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{TranslationService.t('info.step4Title')}</Text>
              <Text style={styles.stepDescription}>
                {TranslationService.t('info.step4Description')}
              </Text>
            </View>
          </View>
        </View>

        {/* Platform Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TranslationService.t('info.stats')}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>10K+</Text>
              <Text style={styles.statLabel}>{TranslationService.t('info.activeUsers')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>$5M+</Text>
              <Text style={styles.statLabel}>{TranslationService.t('info.totalVolume')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>50+</Text>
              <Text style={styles.statLabel}>{TranslationService.t('info.countries')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>{TranslationService.t('info.support')}</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{TranslationService.t('info.contact')}</Text>

          <View style={styles.contactCard}>
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={styles.contactText}>support@globalhedgeai.com</Text>
          </View>
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
  heroSection: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default InfoScreen;

