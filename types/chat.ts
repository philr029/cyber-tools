export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  history?: Array<{ role: MessageRole; content: string }>;
}

export interface ChatResponse {
  reply: string;
}

export interface ChatErrorResponse {
  error: string;
}
