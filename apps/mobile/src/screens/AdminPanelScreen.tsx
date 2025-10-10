import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslationService from '../services/translation';
import { User } from '../types';

interface AdminPanelScreenProps {
  user: User;
  onBack: () => void;
  onNavigateToUsers: () => void;
  onNavigateToDeposits: () => void;
  onNavigateToWithdrawals: () => void;
  onNavigateToMessages: () => void;
  onNavigateToReports: () => void;
}

const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({
  user,
  onBack,
  onNavigateToUsers,
  onNavigateToDeposits,
  onNavigateToWithdrawals,
  onNavigateToMessages,
  onNavigateToReports,
}) => {
  // Check if user is admin
  if (user.role !== 'ADMIN') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{TranslationService.t('admin.title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🚫</Text>
          <Text style={styles.errorText}>{TranslationService.t('admin.accessDenied')}</Text>
          <TouchableOpacity style={styles.backHomeButton} onPress={onBack}>
            <Text style={styles.backHomeButtonText}>
              {TranslationService.t('common.back')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const adminSections = [
    {
      id: 'users',
      title: TranslationService.t('admin.users'),
      icon: '👥',
      description: TranslationService.t('admin.usersDescription'),
      onPress: onNavigateToUsers,
      color: '#3B82F6',
    },
    {
      id: 'deposits',
      title: TranslationService.t('admin.deposits'),
      icon: '💰',
      description: TranslationService.t('admin.depositsDescription'),
      onPress: onNavigateToDeposits,
      color: '#10B981',
    },
    {
      id: 'withdrawals',
      title: TranslationService.t('admin.withdrawals'),
      icon: '💸',
      description: TranslationService.t('admin.withdrawalsDescription'),
      onPress: onNavigateToWithdrawals,
      color: '#F59E0B',
    },
    {
      id: 'messages',
      title: TranslationService.t('admin.messages'),
      icon: '💬',
      description: TranslationService.t('admin.messagesDescription'),
      onPress: onNavigateToMessages,
      color: '#8B5CF6',
    },
    {
      id: 'reports',
      title: 'Financial Reports',
      icon: '📊',
      description: 'View comprehensive financial reports',
      onPress: onNavigateToReports,
      color: '#10B981',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{TranslationService.t('admin.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Admin Badge */}
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeIcon}>👑</Text>
          <Text style={styles.adminBadgeText}>
            {TranslationService.t('admin.adminAccess')}
          </Text>
        </View>

        {/* Admin Sections */}
        <View style={styles.sectionsContainer}>
          {adminSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={styles.sectionCard}
              onPress={section.onPress}
            >
              <View style={[styles.sectionIconContainer, { backgroundColor: section.color + '20' }]}>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
              </View>
              <Text style={styles.sectionArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>
            {TranslationService.t('admin.quickStats')}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statLabel}>{TranslationService.t('admin.totalUsers')}</Text>
              <Text style={styles.statValue}>-</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏳</Text>
              <Text style={styles.statLabel}>{TranslationService.t('admin.pendingRequests')}</Text>
              <Text style={styles.statValue}>-</Text>
            </View>
          </View>
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              ℹ️ {TranslationService.t('admin.webAdminNote')}
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
  adminBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  adminBadgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  adminBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  sectionsContainer: {
    marginBottom: 24,
  },
  sectionCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#94A3B8',
  },
  sectionArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  noteContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  noteText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  backHomeButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backHomeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminPanelScreen;

