import { Request, Response } from 'express';
import ChatLogService from '../services/ChatLogService';

export const startChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const sessionId = await ChatLogService.startChatSession(userId);
    res.status(201).json({ sessionId });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
};

export const addMessageToSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, content, sender, selectedOptionId } = req.body;

    if (!sessionId || !content || !sender) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    await ChatLogService.addMessage(sessionId, content, sender, selectedOptionId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding message to session:', error);
    res.status(500).json({ error: 'Failed to add message to session' });
  }
};

export const endChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, resolved } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    await ChatLogService.endChatSession(sessionId, resolved);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error ending chat session:', error);
    res.status(500).json({ error: 'Failed to end chat session' });
  }
};

export const getChatLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, limit } = req.query;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 50;

    const logs = await ChatLogService.getChatLogs(
      userId as string | undefined,
      parsedLimit
    );

    res.json({ logs });
  } catch (error) {
    console.error('Error getting chat logs:', error);
    res.status(500).json({ error: 'Failed to get chat logs' });
  }
};

export const getChatSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    const session = await ChatLogService.getChatSession(sessionId);

    if (!session) {
      res.status(404).json({ error: 'Chat session not found' });
      return;
    }

    res.json({ session });
  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({ error: 'Failed to get chat session' });
  }
};