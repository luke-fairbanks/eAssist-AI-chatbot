export interface ChatLog {
  sessionId: string;
  userId?: string;
  messages: {
    timestamp: Date;
    content: string;
    sender: 'user' | 'bot';
    selectedOptionId?: string;
  }[];
  startTime: Date;
  endTime?: Date;
  resolved?: boolean;
}