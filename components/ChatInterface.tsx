import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DatabaseService, { Message } from '@/services/DatabaseService';
import MessagingService, { MessageEventData } from '@/services/MessagingService';
import QRCodeService from '@/services/QRCodeService';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ChatInterfaceProps {
  sessionId: string;
  onDisconnect: () => void;
}

export default function ChatInterface({ sessionId, onDisconnect }: ChatInterfaceProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [hostName, setHostName] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
    
    // Set up message listener
    const messageListener = (messageData: MessageEventData) => {
      handleIncomingMessage(messageData);
    };

    const connectionListener = (connected: boolean) => {
      setIsConnected(connected);
      if (connected) {
        showToast('Connected to chat session');
      } else {
        showToast('Disconnected from chat session');
      }
    };

    MessagingService.addMessageListener(messageListener);
    MessagingService.addConnectionListener(connectionListener);

    return () => {
      MessagingService.removeMessageListener(messageListener);
      MessagingService.removeConnectionListener(connectionListener);
    };
  }, [sessionId]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Load existing messages from database
      const existingMessages = await DatabaseService.getMessages(sessionId);
      setMessages(existingMessages);
      
      // Check if messaging service is connected
      setIsConnected(MessagingService.isConnected());
      
      // Try to recreate QR code for current session
      await generateSessionQR();
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSessionQR = async () => {
    try {
      const currentUserName = MessagingService.getCurrentUserName();
      if (currentUserName) {
        // Create QR data for current session
        const qrData = QRCodeService.generateQRCodeData(currentUserName);
        qrData.sessionId = sessionId;
        qrData.timestamp = Date.now();
        
        const qrString = JSON.stringify(qrData);
        setQrValue(qrString);
        setHostName(currentUserName);
      }
    } catch (error) {
      console.error('Error generating session QR:', error);
    }
  };

  const handleIncomingMessage = async (messageData: MessageEventData) => {
    try {
      const isOwnMessage = messageData.sender === MessagingService.getCurrentUserName();
      
      const message: Message = {
        sessionId: messageData.sessionId,
        sender: messageData.sender,
        content: messageData.content,
        timestamp: messageData.timestamp,
        isOwn: isOwnMessage
      };

      // Save to database
      await DatabaseService.saveMessage(message);
      
      // Update local state
      setMessages(prev => [...prev, message]);
      
      // Update session timestamp
      await DatabaseService.updateSessionLastMessage(sessionId, messageData.timestamp);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Show notification for incoming messages (not own)
      if (!isOwnMessage) {
        showToast(`New message from ${messageData.sender}`);
      }
      
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  };

  const sendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText) return;

    if (!isConnected) {
      Alert.alert('Not Connected', 'Please check your connection and try again.');
      return;
    }

    setIsSending(true);
    try {
      // Clear input immediately for better UX
      setInputText('');
      
      // Send message through messaging service
      const success = await MessagingService.sendMessage(messageText);
      
      if (!success) {
        throw new Error('Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore input text on error
      setInputText(messageText);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // For iOS, you might want to use a different notification method
      console.log('Toast:', message);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect',
      'Are you sure you want to disconnect from this chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            MessagingService.disconnect();
            onDisconnect();
          }
        }
      ]
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        {
          backgroundColor: item.isOwn ? colors.myMessage : colors.otherMessage,
          borderColor: colors.borderColor
        }
      ]}>
        {!item.isOwn && (
          <Text style={[styles.senderName, { color: colors.text }]}>
            {item.sender}
          </Text>
        )}
        <Text style={[
          styles.messageText,
          { color: item.isOwn ? (Colors[colorScheme ?? 'light'].myMessageText) : (Colors[colorScheme ?? 'light'].otherMessageText || colors.text) }
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: item.isOwn ? Colors[colorScheme ?? 'light'].myMessageText : (colors.text + '80') }
        ]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading chat...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Chat Session
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => setShowQRModal(true)}
            style={styles.qrButton}
          >
            <IconSymbol 
              name="qrcode" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
          <View style={[
            styles.connectionIndicator,
            { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
          ]} />
          <TouchableOpacity onPress={handleDisconnect}>
            <IconSymbol 
              name="xmark.circle.fill" 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <View style={[styles.inputContainer, { borderTopColor: colors.borderColor }]}>
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.borderColor,
              color: colors.text,
              backgroundColor: colors.cardBackground
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.placeholderText}
          multiline
          maxLength={1000}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { 
              backgroundColor: colors.primary,
              opacity: (!inputText.trim() || isSending) ? 0.5 : 1
            }
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <IconSymbol name="paperplane.fill" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <View />
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {qrValue && (
              <View style={styles.qrModalContainer}>
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={qrValue}
                    size={240}
                    color={colors.text}
                    backgroundColor="white"
                  />
                </View>
                {/* Labels removed for a cleaner QR-only view */}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qrButton: {
    padding: 4,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  qrModalContainer: {
    padding: 20,
    alignItems: 'center',
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  qrInstructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  sessionInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  hostInfo: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
