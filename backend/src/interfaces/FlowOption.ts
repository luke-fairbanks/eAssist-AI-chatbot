export interface FlowOption {
  _id?: string;
  message: string;
  parentId?: string;
  isMenu?: boolean;
  hasUserInput?: boolean;
  closesTicket?: boolean;
  type?: string;
  severity?: number;
  embedding?: number[];
  flowPath?: string;       // New field for storing the conversation path
  originalMessage?: string; // New field for storing the original message
  stopFlow?: boolean;      // New field to indicate that the flow should stop here
  isIntroMessage?: boolean; // Flag to identify the intro message with parentId="root"
}