import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MessagingService from '@/services/MessagingService';
import QRCodeService from '@/services/QRCodeService';
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
  onConnectionEstablished: (sessionId: string) => void;
}

export default function QRGenerator({ onConnectionEstablished }: QRGeneratorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [userName, setUserName] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);

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
        // Initialize connection for the host
        const connected = await MessagingService.initializeConnection({
          sessionId: qrData.sessionId,
          userName: userName.trim(),
          serverUrl: qrData.serverUrl
        });

        if (connected) {
          Alert.alert(
            'QR Code Generated!',
            'Share this QR code with someone to start chatting. The code will expire in 1 hour.',
            [
              { text: 'OK' },
              { 
                text: 'Share QR', 
                onPress: () => shareQRCode(qrString) 
              }
            ]
          );
          
          // Auto-navigate to chat after generating QR
          onConnectionEstablished(qrData.sessionId);
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareQRCode = async (qrString: string) => {
    try {
      await Share.share({
        message: `Join my InstantChat session! Scan this QR code or use this data: ${qrString}`,
        title: 'InstantChat Invitation'
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const resetQRCode = () => {
    setQrValue('');
    setIsWaitingForConnection(false);
    MessagingService.disconnect();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Generate QR Code
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Create a QR code for others to scan and start chatting
      </Text>

      {!qrValue ? (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
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
              size={200}
              color={colors.text}
              backgroundColor={colors.background}
            />
          </View>
          
          <Text style={[styles.instructions, { color: colors.text }]}>
            Ask someone to scan this QR code with the InstantChat app to start chatting!
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
              onPress={() => shareQRCode(qrValue)}
            >
              <Text style={styles.buttonText}>Share QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.borderColor }]}
              onPress={resetQRCode}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>
                Generate New
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
                Ready to chat! QR code is active.
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
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
    padding: 20,
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
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
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
