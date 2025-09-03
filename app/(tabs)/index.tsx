import AppLogo from '@/components/AppLogo';
import ChatHistory from '@/components/ChatHistory';
import ChatInterface from '@/components/ChatInterface';
import QRGenerator from '@/components/QRGenerator';
import QRScanner from '@/components/QRScanner';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors, DesignTokens } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DatabaseService from '@/services/DatabaseService';
import MessagingService from '@/services/MessagingService';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppState = 'menu' | 'generate' | 'scan' | 'chat' | 'history';

const { width: screenWidth } = Dimensions.get('window');

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
      <ThemedView style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <AppLogo size="large" />
        <ThemedText type="body" variant="muted" style={styles.loadingText}>
          Initializing...
        </ThemedText>
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
            {/* Enhanced Header */}
            <ThemedView style={styles.header}>
              <AppLogo size="large" />
              <ThemedText 
                type="h3" 
                variant="primary" 
                align="center"
                style={styles.appTitle}
              >
                InstantChat
              </ThemedText>
              <ThemedText 
                type="body" 
                variant="muted" 
                align="center"
                style={styles.subtitle}
              >
                Connect instantly with QR codes
              </ThemedText>
            </ThemedView>

            {/* Enhanced Menu Container */}
            <View style={styles.menuContainer}>
              <MenuCard
                title="Generate QR Code"
                subtitle="Create a QR code for others to scan"
                icon="qrcode"
                onPress={() => setAppState('generate')}
                colors={colors}
                variant="primary"
              />

              <MenuCard
                title="Scan QR Code"
                subtitle="Scan someone's QR code to connect"
                icon="camera"
                onPress={() => setAppState('scan')}
                colors={colors}
                variant="secondary"
              />

              <MenuCard
                title="Chat History"
                subtitle="View your previous conversations"
                icon="clock"
                onPress={() => setAppState('history')}
                colors={colors}
                variant="outline"
              />
            </View>

            {/* Footer Info */}
            <ThemedView style={styles.footer}>
              <ThemedText type="small" variant="muted" align="center">
                Secure • Fast • Private
              </ThemedText>
            </ThemedView>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {appState !== 'menu' && (
        <ThemedView 
          style={[
            styles.backButton, 
            { 
              borderBottomColor: colors.borderColor,
              backgroundColor: colors.cardBackground,
            }
          ]}
        >
          <TouchableOpacity 
            onPress={() => setAppState('menu')}
            style={styles.backButtonTouchable}
            activeOpacity={0.7}
          >
            <IconSymbol name="back" size={20} variant="primary" />
            <ThemedText 
              type="bodyBold" 
              variant="primary"
              style={styles.backText}
            >
              Back to Menu
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
      {appState === 'history' || appState === 'chat' ? (
        // ChatHistory and ChatInterface have their own scrolling, don't wrap in ScrollView
        renderContent()
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  colors: any;
  variant: 'primary' | 'secondary' | 'outline';
}

const MenuCard: React.FC<MenuCardProps> = ({ title, subtitle, icon, onPress, colors, variant }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primaryLight,
          borderColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondaryLight,
          borderColor: colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
        };
      default:
        return {
          backgroundColor: colors.cardBackground,
          borderColor: colors.borderColor,
        };
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      default:
        return colors.text;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card
        variant="elevated"
        padding="large"
        margin="small"
        borderRadius="large"
        style={[
          styles.menuCard,
          getVariantStyles(),
        ]}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
            <IconSymbol 
              name={icon} 
              size={32} 
              color={getIconColor()}
            />
          </View>
          
          <View style={styles.textContainer}>
            <ThemedText 
              type="h4" 
              weight="semibold"
              style={[
                styles.cardTitle, 
                { color: getIconColor() }
              ]}
            >
              {title}
            </ThemedText>
            <ThemedText 
              type="body" 
              variant="muted"
              style={styles.cardSubtitle}
            >
              {subtitle}
            </ThemedText>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
  },
  header: {
    paddingTop: DesignTokens.spacing.xl,
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingBottom: DesignTokens.spacing.lg,
    alignItems: 'center',
  },
  appTitle: {
    marginTop: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: DesignTokens.spacing.lg,
    lineHeight: 24,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    gap: DesignTokens.spacing.md,
    justifyContent: 'flex-start',
  },
  menuCard: {
    minHeight: 100,
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: DesignTokens.borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: DesignTokens.spacing.xs,
  },
  cardTitle: {
    marginBottom: DesignTokens.spacing.xs,
  },
  cardSubtitle: {
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingBottom: DesignTokens.spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
  },
  backButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
  },
  backText: {
    fontSize: 16,
  },
  loadingText: {
    marginTop: DesignTokens.spacing.lg,
  },
});
