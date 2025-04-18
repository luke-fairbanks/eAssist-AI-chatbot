import ChatLogModel from '../models/ChatLog';
import { ChatLog } from '../interfaces/ChatLog';

class ChatLogService {
  // Start a new chat session
  async startChatSession(userId?: string): Promise<string> {
    try {
      const chatLog = await ChatLogModel.create({
        sessionId: this.generateSessionId(),
        userId,
        messages: [],
        startTime: new Date()
      });

      return chatLog.sessionId;
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw error;
    }
  }

  // Add a message to an existing chat session
  async addMessage(
    sessionId: string,
    content: string,
    sender: 'user' | 'bot',
    selectedOptionId?: string
  ): Promise<void> {
    try {
      await ChatLogModel.updateOne(
        { sessionId },
        {
          $push: {
            messages: {
              timestamp: new Date(),
              content,
              sender,
              selectedOptionId
            }
          }
        }
      );
    } catch (error) {
      console.error('Error adding message to chat log:', error);
      throw error;
    }
  }

  // End a chat session
  async endChatSession(sessionId: string, resolved: boolean = false): Promise<void> {
    try {
      await ChatLogModel.updateOne(
        { sessionId },
        {
          endTime: new Date(),
          resolved
        }
      );
    } catch (error) {
      console.error('Error ending chat session:', error);
      throw error;
    }
  }

  // Get chat logs, with optional filtering by userId
  async getChatLogs(userId?: string, limit: number = 50): Promise<ChatLog[]> {
    try {
      const query = userId ? { userId } : {};
      const chatLogs = await ChatLogModel.find(query)
        .sort({ startTime: -1 })
        .limit(limit)
        .lean();

      return chatLogs;
    } catch (error) {
      console.error('Error getting chat logs:', error);
      throw error;
    }
  }

  // Get a specific chat session by ID
  async getChatSession(sessionId: string): Promise<ChatLog | null> {
    try {
      const chatLog = await ChatLogModel.findOne({ sessionId }).lean();
      return chatLog;
    } catch (error) {
      console.error('Error getting chat session:', error);
      throw error;
    }
  }

  // Generate a simple session ID (in production, use a more robust method)
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default new ChatLogService();