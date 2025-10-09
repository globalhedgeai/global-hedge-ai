// Main App Component for Global Hedge AI Mobile App

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TranslationService from './src/services/translation';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DepositScreen from './src/screens/DepositScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import MarketScreen from './src/screens/MarketScreen';
import ReferralsScreen from './src/screens/ReferralsScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import AccountScreen from './src/screens/AccountScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import InfoScreen from './src/screens/InfoScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import { STORAGE_KEYS } from './src/constants';
import { User } from './src/types';

type Screen = 
  | 'login' 
  | 'register' 
  | 'home' 
  | 'settings' 
  | 'deposit' 
  | 'withdraw' 
  | 'transactions' 
  | 'messages' 
  | 'market' 
  | 'referrals'
  | 'forgot'
  | 'account'
  | 'reports'
  | 'info'
  | 'admin';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize translation service
      await TranslationService.initialize();
      
      // Check auth status
      await checkAuthStatus();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setCurrentScreen('home');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async (userData: User) => {
    setUser(userData);
    setCurrentScreen('home');
    
    // Save user data to storage
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleRegisterSuccess = async (userData: User) => {
    setUser(userData);
    setCurrentScreen('home');
    
    // Save user data to storage
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setUser(null);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navigateToRegister = () => {
    setCurrentScreen('register');
  };

  const navigateToLogin = () => {
    setCurrentScreen('login');
  };

  const navigateToDeposit = () => {
    setCurrentScreen('deposit');
  };

  const navigateToWithdraw = () => {
    setCurrentScreen('withdraw');
  };

  const navigateToTransactions = () => {
    setCurrentScreen('transactions');
  };

  const navigateToMessages = () => {
    setCurrentScreen('messages');
  };

  const navigateToSettings = () => {
    setCurrentScreen('settings');
  };

  const navigateToMarket = () => {
    setCurrentScreen('market');
  };

  const navigateToReferrals = () => {
    setCurrentScreen('referrals');
  };

  const navigateToForgot = () => {
    setCurrentScreen('forgot');
  };

  const navigateToAccount = () => {
    setCurrentScreen('account');
  };

  const navigateToReports = () => {
    setCurrentScreen('reports');
  };

  const navigateToInfo = () => {
    setCurrentScreen('info');
  };

  const navigateToAdmin = () => {
    setCurrentScreen('admin');
  };

  const navigateBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f0b90b" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {currentScreen === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={navigateToRegister}
            onNavigateToForgot={navigateToForgot}
          />
        )}
        
        {currentScreen === 'register' && (
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={navigateToLogin}
          />
        )}
        
        {currentScreen === 'home' && user && (
          <HomeScreen
            user={user}
            onNavigateToDeposit={navigateToDeposit}
            onNavigateToWithdraw={navigateToWithdraw}
            onNavigateToTransactions={navigateToTransactions}
            onNavigateToMessages={navigateToMessages}
            onNavigateToSettings={navigateToSettings}
            onNavigateToMarket={navigateToMarket}
            onNavigateToReferrals={navigateToReferrals}
            onNavigateToAccount={navigateToAccount}
            onNavigateToReports={navigateToReports}
            onNavigateToInfo={navigateToInfo}
            onNavigateToAdmin={navigateToAdmin}
          />
        )}
        
        {currentScreen === 'settings' && user && (
          <SettingsScreen
            onBack={navigateBackToHome}
            onLogout={handleLogout}
          />
        )}
        
        {currentScreen === 'deposit' && user && (
          <DepositScreen
            onBack={navigateBackToHome}
          />
        )}
        
        {currentScreen === 'withdraw' && user && (
          <WithdrawScreen
            onBack={navigateBackToHome}
          />
        )}
        
        {currentScreen === 'transactions' && user && (
          <TransactionsScreen
            onBack={navigateBackToHome}
          />
        )}
        
        {currentScreen === 'messages' && user && (
          <MessagesScreen
            onBack={navigateBackToHome}
          />
        )}
        
        {currentScreen === 'market' && user && (
          <MarketScreen
            onBack={navigateBackToHome}
          />
        )}
        
        {currentScreen === 'referrals' && user && (
          <ReferralsScreen
            onBack={navigateBackToHome}
          />
        )}
        
        {currentScreen === 'forgot' && (
          <ForgotPasswordScreen
            onBack={navigateToLogin}
            onSuccess={navigateToLogin}
          />
        )}
        
        {currentScreen === 'account' && user && (
          <AccountScreen
            user={user}
            onBack={navigateBackToHome}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        )}
        
        {currentScreen === 'reports' && user && (
          <ReportsScreen
            onBack={navigateBackToHome}
          />
        )}
        
        {currentScreen === 'info' && (
          <InfoScreen
            onBack={navigateBackToHome}
          />
        )}
        
        {currentScreen === 'admin' && user && (
          <AdminPanelScreen
            user={user}
            onBack={navigateBackToHome}
            onNavigateToUsers={() => {}}
            onNavigateToDeposits={() => {}}
            onNavigateToWithdrawals={() => {}}
            onNavigateToMessages={() => {}}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0e11',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b0e11',
  },
});

export default App;
