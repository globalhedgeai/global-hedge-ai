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
  updatedAt: string;
  firstDepositAt: string | null;
  lastWithdrawalAt: string | null;
}

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  cryptocurrency: string;
  walletAddress: string;
  txHash: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface AdminFullControlScreenProps {
  onBack: () => void;
}

const AdminFullControlScreen: React.FC<AdminFullControlScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'deposits' | 'withdrawals'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, depositsRes, withdrawalsRes] = await Promise.all([
        ApiService.getAdminUsers(),
        ApiService.getAdminDeposits(),
        ApiService.getAdminWithdrawals()
      ]);

      if (usersRes.ok) {
        setUsers(usersRes.data || []);
      }

      if (depositsRes.ok) {
        setDeposits(depositsRes.data || []);
      }

      if (withdrawalsRes.ok) {
        setWithdrawals(withdrawalsRes.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const saveUserChanges = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const response = await fetch(`${ApiService.baseUrl}/api/admin/users/full-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.ok) {
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...editingUser } : user
        ));
        setEditingUser(null);
        Alert.alert('Success', 'User updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update user: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const saveTransactionChanges = async () => {
    if (!editingTransaction) return;

    setSaving(true);
    try {
      const endpoint = transactionType === 'deposit' 
        ? '/api/admin/deposits/full-update'
        : '/api/admin/withdrawals/full-update';
      
      const response = await fetch(`${ApiService.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTransaction),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.ok) {
        if (transactionType === 'deposit') {
          setDeposits(deposits.map(deposit => 
            deposit.id === editingTransaction.id ? { ...deposit, ...editingTransaction } : deposit
          ));
        } else {
          setWithdrawals(withdrawals.map(withdrawal => 
            withdrawal.id === editingTransaction.id ? { ...withdrawal, ...editingTransaction } : withdrawal
          ));
        }
        setEditingTransaction(null);
        Alert.alert('Success', 'Transaction updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update transaction: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      case 'PENDING': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Full Admin Control</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Full Admin Control</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
              Users ({users.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'deposits' && styles.activeTab]}
            onPress={() => setActiveTab('deposits')}
          >
            <Text style={[styles.tabText, activeTab === 'deposits' && styles.activeTabText]}>
              Deposits ({deposits.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'withdrawals' && styles.activeTab]}
            onPress={() => setActiveTab('withdrawals')}
          >
            <Text style={[styles.tabText, activeTab === 'withdrawals' && styles.activeTabText]}>
              Withdrawals ({withdrawals.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Users Tab */}
        {activeTab === 'users' && (
          <View style={styles.listContainer}>
            {users.map((user) => (
              <View key={user.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{user.email}</Text>
                    <Text style={styles.itemSubtitle}>ID: {user.id.slice(-8)}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                      {user.role}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Balance:</Text>
                    <Text style={styles.detailValue}>{formatCurrency(user.balance)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Wallet:</Text>
                    <Text style={styles.detailValue}>
                      {user.walletAddress ? `${user.walletAddress.slice(0, 8)}...` : 'Not set'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>{formatDate(user.createdAt)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingUser(user)}
                >
                  <Text style={styles.editButtonText}>Edit All</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <View style={styles.listContainer}>
            {deposits.map((deposit) => (
              <View key={deposit.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{deposit.userEmail}</Text>
                    <Text style={styles.itemSubtitle}>ID: {deposit.userId.slice(-8)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deposit.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(deposit.status) }]}>
                      {deposit.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>{formatCurrency(deposit.amount)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Crypto:</Text>
                    <Text style={styles.detailValue}>{deposit.cryptocurrency}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Wallet:</Text>
                    <Text style={styles.detailValue}>{deposit.walletAddress.slice(0, 8)}...</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>TX Hash:</Text>
                    <Text style={styles.detailValue}>
                      {deposit.txHash ? `${deposit.txHash.slice(0, 8)}...` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>{formatDate(deposit.createdAt)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setTransactionType('deposit');
                    setEditingTransaction(deposit);
                  }}
                >
                  <Text style={styles.editButtonText}>Edit All</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <View style={styles.listContainer}>
            {withdrawals.map((withdrawal) => (
              <View key={withdrawal.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{withdrawal.userEmail}</Text>
                    <Text style={styles.itemSubtitle}>ID: {withdrawal.userId.slice(-8)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(withdrawal.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(withdrawal.status) }]}>
                      {withdrawal.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>{formatCurrency(withdrawal.amount)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Crypto:</Text>
                    <Text style={styles.detailValue}>{withdrawal.cryptocurrency}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Wallet:</Text>
                    <Text style={styles.detailValue}>{withdrawal.walletAddress.slice(0, 8)}...</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>TX Hash:</Text>
                    <Text style={styles.detailValue}>
                      {withdrawal.txHash ? `${withdrawal.txHash.slice(0, 8)}...` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>{formatDate(withdrawal.createdAt)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setTransactionType('withdrawal');
                    setEditingTransaction(withdrawal);
                  }}
                >
                  <Text style={styles.editButtonText}>Edit All</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit User Modal */}
      {editingUser && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User: {editingUser.email}</Text>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editingUser.email}
                  onChangeText={(text) => setEditingUser({ ...editingUser, email: text })}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.roleSelector}>
                  {['USER', 'ADMIN', 'SUPPORT', 'ACCOUNTING'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        editingUser.role === role && styles.roleOptionActive
                      ]}
                      onPress={() => setEditingUser({ ...editingUser, role: role as any })}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        editingUser.role === role && styles.roleOptionTextActive
                      ]}>
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Balance</Text>
                <TextInput
                  style={styles.input}
                  value={editingUser.balance.toString()}
                  onChangeText={(text) => setEditingUser({ ...editingUser, balance: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Referral Code</Text>
                <TextInput
                  style={styles.input}
                  value={editingUser.referralCode}
                  onChangeText={(text) => setEditingUser({ ...editingUser, referralCode: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wallet Address</Text>
                <TextInput
                  style={styles.input}
                  value={editingUser.walletAddress || ''}
                  onChangeText={(text) => setEditingUser({ ...editingUser, walletAddress: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Created At</Text>
                <TextInput
                  style={styles.input}
                  value={formatDateTime(editingUser.createdAt)}
                  onChangeText={(text) => setEditingUser({ ...editingUser, createdAt: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Updated At</Text>
                <TextInput
                  style={styles.input}
                  value={formatDateTime(editingUser.updatedAt)}
                  onChangeText={(text) => setEditingUser({ ...editingUser, updatedAt: text })}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditingUser(null)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveUserChanges}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </Text>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={editingTransaction.amount.toString()}
                  onChangeText={(text) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cryptocurrency</Text>
                <TextInput
                  style={styles.input}
                  value={editingTransaction.cryptocurrency}
                  onChangeText={(text) => setEditingTransaction({ ...editingTransaction, cryptocurrency: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wallet Address</Text>
                <TextInput
                  style={styles.input}
                  value={editingTransaction.walletAddress}
                  onChangeText={(text) => setEditingTransaction({ ...editingTransaction, walletAddress: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Transaction Hash</Text>
                <TextInput
                  style={styles.input}
                  value={editingTransaction.txHash || ''}
                  onChangeText={(text) => setEditingTransaction({ ...editingTransaction, txHash: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusSelector}>
                  {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        editingTransaction.status === status && styles.statusOptionActive
                      ]}
                      onPress={() => setEditingTransaction({ ...editingTransaction, status: status as any })}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        editingTransaction.status === status && styles.statusOptionTextActive
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Created At</Text>
                <TextInput
                  style={styles.input}
                  value={formatDateTime(editingTransaction.createdAt)}
                  onChangeText={(text) => setEditingTransaction({ ...editingTransaction, createdAt: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Updated At</Text>
                <TextInput
                  style={styles.input}
                  value={formatDateTime(editingTransaction.updatedAt)}
                  onChangeText={(text) => setEditingTransaction({ ...editingTransaction, updatedAt: text })}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditingTransaction(null)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveTransactionChanges}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginLeft: 12,
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
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
  listContainer: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDetails: {
    gap: 8,
    marginBottom: 12,
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
  editButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F1F5F9',
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleOptionText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  roleOptionTextActive: {
    color: '#FFFFFF',
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  statusOptionText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminFullControlScreen;
