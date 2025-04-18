import mongoose, { Schema, Document } from 'mongoose';
import { FlowOption } from '../interfaces/FlowOption';

export interface FlowOptionDocument extends Omit<FlowOption, '_id'>, Document {}

const FlowOptionSchema: Schema = new Schema({
  message: { type: String, required: true },
  parentId: { type: String, default: null },
  isMenu: { type: Boolean, default: false },
  hasUserInput: { type: Boolean, default: false },
  closesTicket: { type: Boolean, default: false },
  type: { type: String, default: null },
  severity: { type: Number, default: null }
  // Embedding is not stored in the database as per requirements
});

// Specify the collection name explicitly as 'flowOptionBasesAiTest'
export default mongoose.model<FlowOptionDocument>('FlowOption', FlowOptionSchema, 'flowOptionBasesAiTest');