import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MessagingService from '@/services/MessagingService';
import QRCodeService from '@/services/QRCodeService';
import { BarcodeScanningResult, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface QRScannerProps {
  onConnectionEstablished: (sessionId: string) => void;
}

export default function QRScanner({ onConnectionEstablished }: QRScannerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  useEffect(() => {
    checkCameraPermissions();
  }, []);

  const checkCameraPermissions = async () => {
    const { granted } = await QRCodeService.checkCameraPermissions();
    setHasPermission(granted);
  };

  const requestPermission = async () => {
    const granted = await QRCodeService.requestCameraPermissions();
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert(
        'Camera Permission Required',
        'This app needs camera access to scan QR codes. Please enable camera permission in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanning) return; // Prevent multiple scans
    
    setScanning(false);
    processQRCode(data);
  };

  const processQRCode = (qrData: string) => {
    const parsedData = QRCodeService.parseQRCodeData(qrData);
    
    if (!parsedData) {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not valid for InstantChat or has expired.',
        [
          { text: 'Try Again', onPress: () => setScanning(true) },
          { text: 'Cancel' }
        ]
      );
      return;
    }

    setScannedData(parsedData);
    setShowNameInput(true);
  };

  const processManualCode = () => {
    if (!manualCode.trim()) {
      Alert.alert('Error', 'Please enter the QR code data');
      return;
    }

    processQRCode(manualCode.trim());
    setShowManualInput(false);
    setManualCode('');
  };

  const connectToChat = async () => {
    if (!userName.trim() || !scannedData) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsConnecting(true);
    
    try {
      const connected = await MessagingService.initializeConnection({
        sessionId: scannedData.sessionId,
        userName: userName.trim(),
        serverUrl: scannedData.serverUrl
      });

      if (connected) {
        Alert.alert(
          'Connected!',
          `You've successfully connected to ${scannedData.userName}'s chat session.`,
          [{ text: 'Start Chatting', onPress: () => {
            setShowNameInput(false);
            onConnectionEstablished(scannedData.sessionId);
          }}]
        );
      } else {
        throw new Error('Failed to establish connection');
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert(
        'Connection Failed',
        'Unable to connect to the chat session. Please try again.',
        [
          { text: 'Retry', onPress: connectToChat },
          { text: 'Cancel', onPress: () => setShowNameInput(false) }
        ]
      );
    } finally {
      setIsConnecting(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.text, { color: colors.text }]}>
          Checking camera permissions...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Camera Permission Required
        </Text>
        <Text style={[styles.text, { color: colors.text }]}>
          This app needs access to your camera to scan QR codes.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.manualButton, { borderColor: colors.borderColor }]}
          onPress={() => setShowManualInput(true)}
        >
          <Text style={[styles.manualButtonText, { color: colors.text }]}>
            Enter Code Manually
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Scan QR Code
      </Text>
      
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Point your camera at the QR code to connect
      </Text>

      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
          
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.background }]}
            onPress={() => setScanning(false)}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => setScanning(true)}
          >
            <Text style={styles.buttonText}>Start Scanning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.manualButton, { borderColor: colors.borderColor }]}
            onPress={() => setShowManualInput(true)}
          >
            <Text style={[styles.manualButtonText, { color: colors.text }]}>
              Enter Code Manually
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Input Modal */}
      <Modal
        visible={showManualInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Enter QR Code Data
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
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Paste QR code data here..."
              placeholderTextColor={colors.placeholderText}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={processManualCode}
              >
                <Text style={styles.buttonText}>Connect</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={() => {
                  setShowManualInput(false);
                  setManualCode('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Name Input Modal */}
      <Modal
        visible={showNameInput}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Join Chat Session
            </Text>
            
            <Text style={[styles.modalText, { color: colors.text }]}>
              You're about to join {scannedData?.userName}'s chat session.
            </Text>
            
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { backgroundColor: colors.primary },
                  isConnecting && styles.disabledButton
                ]}
                onPress={connectToChat}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Join Chat</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={() => {
                  setShowNameInput(false);
                  setUserName('');
                  setScannedData(null);
                }}
                disabled={isConnecting}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
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
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
