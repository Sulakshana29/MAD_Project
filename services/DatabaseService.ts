import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import WebDatabaseService from './WebDatabaseService';

export interface Message {
  id?: number;
  sessionId: string;
  sender: string;
  content: string;
  timestamp: number;
  isOwn: boolean;
}

export interface ChatSession {
  id?: number;
  sessionId: string;
  participantName: string;
  createdAt: number;
  lastMessageAt: number;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isWeb = Platform.OS === 'web';

  async initialize() {
    try {
      if (this.isWeb) {
        // Use AsyncStorage-based service for web
        await WebDatabaseService.initialize();
        console.log('Web Database (AsyncStorage) initialized successfully');
        return;
      }

      // Use SQLite for mobile platforms
      this.db = await SQLite.openDatabaseAsync('instantchat.db');
      
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sessionId TEXT UNIQUE NOT NULL,
          participantName TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          lastMessageAt INTEGER NOT NULL
        );
      `);

      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sessionId TEXT NOT NULL,
          sender TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          isOwn INTEGER NOT NULL,
          FOREIGN KEY (sessionId) REFERENCES chat_sessions (sessionId)
        );
      `);

      console.log('SQLite Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  async saveMessage(message: Message): Promise<number> {
    if (this.isWeb) {
      return await WebDatabaseService.saveMessage(message);
    }

    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.runAsync(
        'INSERT INTO messages (sessionId, sender, content, timestamp, isOwn) VALUES (?, ?, ?, ?, ?)',
        [message.sessionId, message.sender, message.content, message.timestamp, message.isOwn ? 1 : 0]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    if (this.isWeb) {
      return await WebDatabaseService.getMessages(sessionId);
    }

    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM messages WHERE sessionId = ? ORDER BY timestamp ASC',
        [sessionId]
      ) as any[];

      return result.map(row => ({
        id: row.id,
        sessionId: row.sessionId,
        sender: row.sender,
        content: row.content,
        timestamp: row.timestamp,
        isOwn: row.isOwn === 1
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async saveChatSession(session: ChatSession): Promise<void> {
    if (this.isWeb) {
      return await WebDatabaseService.saveChatSession(session);
    }

    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO chat_sessions (sessionId, participantName, createdAt, lastMessageAt) VALUES (?, ?, ?, ?)',
        [session.sessionId, session.participantName, session.createdAt, session.lastMessageAt]
      );
    } catch (error) {
      console.error('Error saving chat session:', error);
      throw error;
    }
  }

  async getChatSessions(): Promise<ChatSession[]> {
    if (this.isWeb) {
      return await WebDatabaseService.getChatSessions();
    }

    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM chat_sessions ORDER BY lastMessageAt DESC'
      ) as any[];

      return result.map(row => ({
        id: row.id,
        sessionId: row.sessionId,
        participantName: row.participantName,
        createdAt: row.createdAt,
        lastMessageAt: row.lastMessageAt
      }));
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  }

  async updateSessionLastMessage(sessionId: string, timestamp: number): Promise<void> {
    if (this.isWeb) {
      return await WebDatabaseService.updateSessionLastMessage(sessionId, timestamp);
    }

    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync(
        'UPDATE chat_sessions SET lastMessageAt = ? WHERE sessionId = ?',
        [timestamp, sessionId]
      );
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    if (this.isWeb) {
      return await WebDatabaseService.deleteChatSession(sessionId);
    }

    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.runAsync('DELETE FROM messages WHERE sessionId = ?', [sessionId]);
      await this.db.runAsync('DELETE FROM chat_sessions WHERE sessionId = ?', [sessionId]);
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
