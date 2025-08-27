import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Socket } from 'socket.io-client';
import FirebaseService from './FirebaseService';

export interface ChatConnectionInfo {
  sessionId: string;
  userName: string;
  serverUrl: string;
}

export interface MessageEventData {
  sessionId: string;
  sender: string;
  content: string;
  timestamp: number;
}

class MessagingService {
  private socket: Socket | null = null;
  private currentSessionId: string | null = null;
  private currentUserName: string | null = null;
  private messageListeners: ((message: MessageEventData) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private isAndroid = Platform.OS === 'android';
  private usingFirebase = FirebaseService.isEnabled();
  private firebaseSubscribedForSession: string | null = null;

  async initializeConnection(connectionInfo: ChatConnectionInfo): Promise<boolean> {
    try {
  // Android-specific initialization
      if (this.isAndroid) {
        console.log('Initializing connection for Android platform');
        // Add Android-specific timeout handling
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout on Android')), 10000);
        });

  const connectionPromise = this.establishConnection(connectionInfo);
        
        await Promise.race([connectionPromise, timeoutPromise]);
      } else {
        await this.establishConnection(connectionInfo);
      }

      return true;
    } catch (error) {
      console.error('Connection initialization error:', error);
      this.notifyConnectionListeners(false);
      return false;
    }
  }

  private async establishConnection(connectionInfo: ChatConnectionInfo): Promise<void> {
    this.currentSessionId = connectionInfo.sessionId;
    this.currentUserName = connectionInfo.userName;

    // Store connection info for reconnection
    await AsyncStorage.setItem('currentConnection', JSON.stringify(connectionInfo));

    if (this.usingFirebase) {
      await FirebaseService.connect(connectionInfo);
      // Subscribe to Firestore messages once per session
      if (this.firebaseSubscribedForSession !== connectionInfo.sessionId) {
        FirebaseService.subscribeMessages(connectionInfo.sessionId, (msg) => {
          this.notifyMessageListeners(msg);
        });
        this.firebaseSubscribedForSession = connectionInfo.sessionId;
      }
    }

    // Connection success
    this.notifyConnectionListeners(true);
    console.log('Chat connection initialized for session:', connectionInfo.sessionId, this.usingFirebase ? '(Firebase)' : '(Simulated)');
  }

  disconnect(): void {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      if (this.usingFirebase) {
        FirebaseService.disconnect();
        this.firebaseSubscribedForSession = null;
      }
      
      this.currentSessionId = null;
      this.currentUserName = null;
      this.notifyConnectionListeners(false);
      
      AsyncStorage.removeItem('currentConnection').catch(error => {
        console.error('Error removing connection info:', error);
      });
      
      console.log('Disconnected from chat session');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  async sendMessage(content: string): Promise<boolean> {
    if (!this.currentSessionId || !this.currentUserName) {
      console.error('No active session for sending message');
      return false;
    }

    try {
      const messageData: MessageEventData = {
        sessionId: this.currentSessionId,
        sender: this.currentUserName,
        content,
        timestamp: Date.now()
      };

      if (this.usingFirebase) {
        await FirebaseService.sendMessage(messageData.sessionId, messageData.sender, messageData.content);
        // Rely on Firestore onSnapshot to deliver to listeners on both devices.
      } else {
        // Android-specific message handling
        if (this.isAndroid) {
          const maxRetries = 3;
          let retries = 0;
          while (retries < maxRetries) {
            try {
              await this.processMessage(messageData);
              break;
            } catch (error) {
              retries++;
              if (retries >= maxRetries) throw error;
              console.warn(`Message send retry ${retries} on Android`);
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
          }
        } else {
          await this.processMessage(messageData);
        }
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  private async processMessage(messageData: MessageEventData): Promise<void> {
    // In a real app, emit to socket server
    // this.socket?.emit('message', messageData);

    // For demo, simulate message delivery
    await new Promise(resolve => setTimeout(resolve, 100));
    this.notifyMessageListeners(messageData);
  }

  // Demo method to simulate incoming messages
  private simulateIncomingMessage(originalContent: string): void {
    if (!this.currentSessionId) return;

    // Simulate various responses based on the message content
    const responses = [
      "That's interesting!",
      "I see what you mean.",
      "Thanks for sharing that.",
      "Could you tell me more?",
      "I agree with you.",
      "That's a good point."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  // Simulation disabled for real-user demo
  }

  addMessageListener(listener: (message: MessageEventData) => void): void {
    this.messageListeners.push(listener);
  }

  removeMessageListener(listener: (message: MessageEventData) => void): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  addConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners.push(listener);
  }

  removeConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }

  private notifyMessageListeners(message: MessageEventData): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  getCurrentUserName(): string | null {
    return this.currentUserName;
  }

  isConnected(): boolean {
    return this.currentSessionId !== null;
  }

  // Method to restore connection on app resume
  async restoreConnection(): Promise<boolean> {
    try {
      const connectionInfoStr = await AsyncStorage.getItem('currentConnection');
      if (connectionInfoStr) {
        const connectionInfo: ChatConnectionInfo = JSON.parse(connectionInfoStr);
        return await this.initializeConnection(connectionInfo);
      }
      return false;
    } catch (error) {
      console.error('Error restoring connection:', error);
      return false;
    }
  }
}

export default new MessagingService();
