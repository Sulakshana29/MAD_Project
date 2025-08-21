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

  const handleConnectionEstablished = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setAppState('chat');
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
        <ThemedText type="title">InstantChat</ThemedText>
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
              <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
                InstantChat
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.text }]}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
    </View>
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
  },
  header: {
    padding: 30,
    alignItems: 'center',
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
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    gap: 20,
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
    marginVertical: 8,
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
    padding: 16,
    borderBottomWidth: 1,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
