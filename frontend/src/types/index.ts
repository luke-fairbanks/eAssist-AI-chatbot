export interface FlowOption {
  _id: string;
  message: string;
  parentId?: string;
  isMenu?: boolean;
  hasUserInput?: boolean;
  closesTicket?: boolean;
  type?: string;
  severity?: number;
  flowPath?: string;       // New field for showing conversation path
  originalMessage?: string; // Original message without path context
  stopFlow?: boolean;      // New field to indicate that the flow should stop here
  isIntroMessage?: boolean; // Flag to identify the intro message with parentId="root"
  isInstruction?: boolean; // Flag to identify instruction messages
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  options?: FlowOption[];
  timestamp: Date;
  showFlowPath?: boolean;  // New field to control when to show the path
  isProcessing?: boolean;  // Flag to indicate a loading/processing state
}

export interface ApiResponse {
  options: FlowOption[];
}