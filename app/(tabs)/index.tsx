import AppLogo from '@/components/AppLogo';
import ChatHistory from '@/components/ChatHistory';
import ChatInterface from '@/components/ChatInterface';
import QRGenerator from '@/components/QRGenerator';
import QRScanner from '@/components/QRScanner';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DatabaseService from '@/services/DatabaseService';
import MessagingService from '@/services/MessagingService';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppState = 'menu' | 'generate' | 'scan' | 'chat' | 'history';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [appState, setAppState] = useState<AppState>('menu');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.initialize();
      
      // Try to restore connection if exists
      await MessagingService.restoreConnection();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Initialization Error', 'Failed to initialize the app. Please restart.');
    }
  };

  const handleConnectionEstablished = async (sessionId: string, participantName?: string) => {
    setCurrentSessionId(sessionId);
    setAppState('chat');

    // Save chat session so it appears in history
    try {
      const now = Date.now();
      await DatabaseService.saveChatSession({
        sessionId,
        participantName: participantName || 'Chat Partner',
        createdAt: now,
        lastMessageAt: now,
      });
    } catch (err) {
      console.warn('Failed to save chat session:', err);
    }
  };

  const handleDisconnect = () => {
    setCurrentSessionId(null);
    setAppState('menu');
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setAppState('chat');
  };

  if (!isInitialized) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <AppLogo size="large" />
        <ThemedText>Initializing...</ThemedText>
      </ThemedView>
    );
  }

  const renderContent = () => {
    switch (appState) {
      case 'generate':
        return (
          <QRGenerator 
            onConnectionEstablished={handleConnectionEstablished}
          />
        );
      
      case 'scan':
        return (
          <QRScanner 
            onConnectionEstablished={handleConnectionEstablished}
          />
        );
      
      case 'chat':
        return currentSessionId ? (
          <ChatInterface 
            sessionId={currentSessionId}
            onDisconnect={handleDisconnect}
          />
        ) : null;
      
      case 'history':
        return (
          <ChatHistory 
            onSessionSelect={handleSessionSelect}
          />
        );
      
      default:
        return (
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={styles.header}>
              <AppLogo size="large" />
              <ThemedText style={[styles.subtitle, { color: colors.text, marginTop: 20 }]}>
                Connect instantly with QR codes
              </ThemedText>
            </ThemedView>

            <View style={styles.menuContainer}>
              <MenuButton
                title="Generate QR Code"
                subtitle="Create a QR code for others to scan"
                icon="qrcode"
                onPress={() => setAppState('generate')}
                colors={colors}
              />

              <MenuButton
                title="Scan QR Code"
                subtitle="Scan someone's QR code to connect"
                icon="camera"
                onPress={() => setAppState('scan')}
                colors={colors}
              />

              <MenuButton
                title="Chat History"
                subtitle="View your previous conversations"
                icon="clock"
                onPress={() => setAppState('history')}
                colors={colors}
              />
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {appState !== 'menu' && (
        <View style={[styles.backButton, { borderBottomColor: colors.text + '20' }]}>
          <TouchableOpacity onPress={() => setAppState('menu')}>
            <ThemedText 
              style={[styles.backText, { color: colors.tint }]}
            >
              ← Back to Menu
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
      {renderContent()}
    </SafeAreaView>
  );
}

interface MenuButtonProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  colors: any;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, subtitle, onPress, colors }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <ThemedView 
      style={[
        styles.menuButton, 
        { 
          backgroundColor: colors.cardBackground || colors.background,
          borderColor: colors.borderColor || colors.primary,
          shadowColor: colors.primary,
        }
      ]}
    >
      <ThemedText type="subtitle" style={[styles.buttonTitle, { color: colors.primary }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.buttonSubtitle, { color: colors.placeholderText || colors.text }]}>
        {subtitle}
      </ThemedText>
    </ThemedView>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // Add horizontal padding for phone edges
  },
  header: {
    paddingTop: 20,        // Reduced top padding 
    paddingHorizontal: 30, // Keep horizontal padding
    paddingBottom: 20,     // Add bottom padding
    alignItems: 'center',  // Center align - change to 'flex-start' for left align
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20, // Add padding for better text wrapping
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20, // Side margins
    paddingVertical: 10,   // Top/bottom spacing
    gap: 15,              // Reduced gap for better fit
    justifyContent: 'flex-start', // Align buttons to top
  },
  menuButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 5,    // Reduced margin
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  buttonSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    paddingHorizontal: 20, // Better horizontal padding
    paddingVertical: 12,   // Vertical padding
    borderBottomWidth: 1,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
