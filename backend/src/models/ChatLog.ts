import mongoose, { Schema, Document } from 'mongoose';
import { ChatLog } from '../interfaces/ChatLog';

export interface ChatLogDocument extends Omit<ChatLog, '_id'>, Document {}

const ChatLogSchema: Schema = new Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String },
  messages: [{
    timestamp: { type: Date, default: Date.now },
    content: { type: String, required: true },
    sender: { type: String, enum: ['user', 'bot'], required: true },
    selectedOptionId: { type: String }
  }],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  resolved: { type: Boolean, default: false }
});

export default mongoose.model<ChatLogDocument>('ChatLog', ChatLogSchema);