import AsyncStorage from '@react-native-async-storage/async-storage';
import { Socket } from 'socket.io-client';

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

  async initializeConnection(connectionInfo: ChatConnectionInfo): Promise<boolean> {
    try {
      // For demo purposes, we'll simulate a WebSocket server
      // In a real app, you'd connect to your actual server
      this.currentSessionId = connectionInfo.sessionId;
      this.currentUserName = connectionInfo.userName;

      // Store connection info for reconnection
      await AsyncStorage.setItem('currentConnection', JSON.stringify(connectionInfo));

      // Simulate connection success
      this.notifyConnectionListeners(true);
      
      console.log('Chat connection initialized for session:', connectionInfo.sessionId);
      return true;
    } catch (error) {
      console.error('Connection initialization error:', error);
      this.notifyConnectionListeners(false);
      return false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.currentSessionId = null;
    this.currentUserName = null;
    this.notifyConnectionListeners(false);
    
    AsyncStorage.removeItem('currentConnection');
    console.log('Disconnected from chat session');
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

      // In a real app, emit to socket server
      // this.socket?.emit('message', messageData);

      // For demo, simulate message delivery
      setTimeout(() => {
        this.notifyMessageListeners(messageData);
      }, 100);

      // Simulate receiving a response (for demo purposes)
      this.simulateIncomingMessage(content);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
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

    setTimeout(() => {
      const incomingMessage: MessageEventData = {
        sessionId: this.currentSessionId!,
        sender: 'Chat Partner',
        content: randomResponse,
        timestamp: Date.now()
      };

      this.notifyMessageListeners(incomingMessage);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
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
