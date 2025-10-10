import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslationService from '../services/translation';
import ApiService from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPPORT' | 'ACCOUNTING';
  balance: number;
  referralCode: string;
  walletAddress: string | null;
  createdAt: string;
}

interface AdminUsersScreenProps {
  onBack: () => void;
}

const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingBalance, setEditingBalance] = useState<{ userId: string; balance: number } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await ApiService.getAdminUsers();
      if (response.ok) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    try {
      const response = await ApiService.updateUserBalance(userId, newBalance);
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, balance: newBalance } : user
        ));
        setEditingBalance(null);
        Alert.alert('Success', 'Balance updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      Alert.alert('Error', 'Failed to update balance');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#EF4444';
      case 'SUPPORT': return '#3B82F6';
      case 'ACCOUNTING': return '#8B5CF6';
      case 'USER': return '#10B981';
      default: return '#94A3B8';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑';
      case 'SUPPORT': return '🛠️';
      case 'ACCOUNTING': return '💰';
      case 'USER': return '👤';
      default: return '❓';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Management</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading users...</Text>
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
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.userCount}>({users.length})</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userId}>ID: {user.id.slice(-8)}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                <Text style={styles.roleIcon}>{getRoleIcon(user.role)}</Text>
                <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                  {user.role}
                </Text>
              </View>
            </View>

            <View style={styles.userDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balance:</Text>
                {editingBalance?.userId === user.id ? (
                  <View style={styles.balanceEditContainer}>
                    <TextInput
                      style={styles.balanceInput}
                      value={editingBalance.balance.toString()}
                      onChangeText={(text) => setEditingBalance({ userId: user.id, balance: parseFloat(text) || 0 })}
                      keyboardType="numeric"
                      placeholder="0.00"
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => updateUserBalance(user.id, editingBalance.balance)}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setEditingBalance(null)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.balanceContainer}>
                    <Text style={styles.balanceValue}>
                      {formatCurrency(user.balance)}
                    </Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setEditingBalance({ userId: user.id, balance: user.balance })}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Referral Code:</Text>
                <Text style={styles.detailValue}>{user.referralCode}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Wallet:</Text>
                <Text style={styles.detailValue}>
                  {user.walletAddress ? `${user.walletAddress.slice(0, 8)}...` : 'Not set'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Joined:</Text>
                <Text style={styles.detailValue}>{formatDate(user.createdAt)}</Text>
              </View>
            </View>
          </View>
        ))}

        {users.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No users found</Text>
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
    flex: 1,
  },
  userCount: {
    fontSize: 16,
    color: '#94A3B8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  userId: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#F1F5F9',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  balanceEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#F1F5F9',
    fontSize: 14,
    width: 80,
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default AdminUsersScreen;
