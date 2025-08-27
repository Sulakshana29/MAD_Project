import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MessagingService from '@/services/MessagingService';
import QRCodeService from '@/services/QRCodeService';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRGeneratorProps {
  onConnectionEstablished: (sessionId: string, participantName?: string) => void;
}

export default function QRGenerator({ onConnectionEstablished }: QRGeneratorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [userName, setUserName] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);
  const [generatedSessionId, setGeneratedSessionId] = useState<string | null>(null);

  const generateQRCode = async () => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsGenerating(true);
    try {
      const qrString = await QRCodeService.createQRCodeString(userName.trim());
      setQrValue(qrString);
      setIsWaitingForConnection(true);
      
      // Parse the QR data to get session ID
      const qrData = QRCodeService.parseQRCodeData(qrString);
      if (qrData) {
        setGeneratedSessionId(qrData.sessionId);
        // Initialize connection for the host
        const connected = await MessagingService.initializeConnection({
          sessionId: qrData.sessionId,
          userName: userName.trim(),
          serverUrl: qrData.serverUrl
        });

        // Keep QR visible; user will choose when to open chat.
        // We still show controls below (share/copy/open chat).
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (qrString: string) => {
    try {
      await Clipboard.setStringAsync(qrString);
      Alert.alert('Copied!', 'QR code data copied to clipboard. You can share it manually.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard.');
    }
  };

  const shareQRCode = async (qrString: string) => {
    try {
      const qrData = QRCodeService.parseQRCodeData(qrString);
      if (!qrData) {
        Alert.alert('Error', 'Invalid QR code data');
        return;
      }

      // Create a user-friendly sharing message
      const shareMessage = `🚀 Join my InstantChat session!

👤 Host: ${qrData.userName}
📱 Session ID: ${qrData.sessionId}
⏰ Valid until: ${new Date(qrData.timestamp + 60 * 60 * 1000).toLocaleString()}

📋 To join:
1. Open InstantChat app
2. Tap "Scan QR Code"
3. Tap "Enter Code Manually"
4. Paste this data: ${qrString}

Or scan the QR code directly!`;

      await Share.share({
        message: shareMessage,
        title: 'Join my InstantChat session!'
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code. Please try again.');
    }
  };

  const resetQRCode = () => {
    setQrValue('');
    setIsWaitingForConnection(false);
  setGeneratedSessionId(null);
    MessagingService.disconnect();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
  {/* Minimal header to focus on QR */}

      {!qrValue ? (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text, textAlign: 'center'}]}>
            Enter your name:
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: colors.borderColor,
                color: colors.text,
                backgroundColor: colors.cardBackground
              }
            ]}
            value={userName}
            onChangeText={setUserName}
            placeholder="Your name"
            placeholderTextColor={colors.placeholderText}
            maxLength={50}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[
              styles.generateButton,
              { backgroundColor: colors.primary },
              isGenerating && styles.disabledButton
            ]}
            onPress={generateQRCode}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Generate QR Code</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.qrContainer}>
      <View style={styles.qrCodeWrapper}>
            <QRCode
              value={qrValue}
        size={240}
              color={colors.text}
              backgroundColor={colors.background}
            />
          </View>
      {/* Removed instruction text for cleaner UI */}

          <View style={styles.buttonContainer}>
            {/* Primary action to proceed when ready */}
    <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (generatedSessionId) {
      // For the host, the participant name is initially unknown.
      onConnectionEstablished(generatedSessionId, 'Chat Partner');
                }
              }}
            >
              <Text style={styles.buttonText}>✅ Open Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
              onPress={() => shareQRCode(qrValue)}
            >
              <Text style={styles.buttonText}>📤 Share Invitation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.copyButton,{ borderColor: colors.borderColor }]}
              onPress={() => copyToClipboard(qrValue)}
            >
              <Text style={styles.buttonText}>📋 Copy Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.borderColor }]}
              onPress={resetQRCode}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>
                🔄 Generate New
              </Text>
            </TouchableOpacity>
          </View>

      {isWaitingForConnection && (
            <View style={styles.waitingContainer}>
              <ActivityIndicator 
                size="small" 
                color={colors.primary} 
                style={styles.waitingSpinner}
              />
              <Text style={[styles.waitingText, { color: colors.text }]}>
        QR is active. Ask your friend to scan, then tap "Open Chat".
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    display: 'none',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  generateButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    width: '100%',
  },
  qrCodeWrapper: {
  padding: 16,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 12,
  },
  instructions: { display: 'none' },
  buttonContainer: {
    flexDirection: 'column',
    gap: 15,
    width: '100%',
    maxWidth: 250,
  },
  shareButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  waitingSpinner: {
    marginRight: 10,
  },
  waitingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
