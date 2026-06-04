import apiClient from "./client";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  createdAt: string;
}

// Sesuai response backend ChatService.createSession
interface CreateSessionResponse {
  sessionId: string;
  createdAt: string;
}

// Sesuai response backend ChatService.getSessionHistory
interface SessionHistoryResponse {
  sessionId: string;
  status: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  }>;
}

export interface SendMessageResponse {
  reply: string;
  intent: string;
  handoff: boolean;
  sessionId: string;
}

export const chatService = {
  async createSession(params: {
    visitorId?: string;
    pageUrl?: string;
    productSlug?: string;
  }): Promise<string> {
    const { data } = await apiClient.post<CreateSessionResponse>(
      "/chat/session",
      params
    );
    return data.sessionId;
  },

  async sendMessage(params: {
    sessionId: string;
    message: string;
    pageUrl?: string;
    productSlug?: string;
  }): Promise<SendMessageResponse> {
    const { data } = await apiClient.post<SendMessageResponse>(
      "/chat/message",
      params,
      { timeout: 90_000 } // OpenClaw butuh 30-60s, jauh lebih lama dari default 15s
    );
    return data;
  },

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<SessionHistoryResponse>(
      `/chat/session/${sessionId}/history`
    );
    // Map 'assistant' → 'bot' untuk konsistensi UI
    return data.messages.map((m) => ({
      id: m.id,
      role: m.role === "assistant" ? "bot" : "user",
      content: m.content,
      createdAt: m.createdAt,
    }));
  },
};
