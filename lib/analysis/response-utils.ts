export enum MessageType {
  ERROR = "error",
  AI_CHUNK = "ai_chunk",
  COUNT = "count",
  ANALYSIS_ID = "analysis_id",
  CACHE = "cache",
}

export interface SendMessageParams {
  controller: ReadableStreamDefaultController;
  type: MessageType;
  content?: string | number | null;
}

export function sendMessage({ controller, type, content }: SendMessageParams) {
  const message = `data: ${JSON.stringify({ type, content })}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}
