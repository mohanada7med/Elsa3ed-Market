import type { Response } from 'express';
import { Logger } from '../utils/logger.ts';
import type { MessageDocument, ConversationDocument } from '../models/types.ts';

interface ClientConnection {
  userId: string;
  res: Response;
  connectedAt: number;
}

class ChatRealtimeService {
  private clients: Map<string, Set<ClientConnection>> = new Map();
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Keepalive ping every 25 seconds to prevent browser & proxy timeouts
    this.keepAliveInterval = setInterval(() => {
      this.sendKeepAlive();
    }, 25000);
    this.keepAliveInterval.unref?.();
  }

  /**
   * Register a new SSE connection for a specific authenticated user
   */
  public registerClient(userId: string, res: Response): void {
    if (!userId || !res) return;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (Nginx / Vercel)
    res.flushHeaders?.();

    const connection: ClientConnection = {
      userId,
      res,
      connectedAt: Date.now()
    };

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(connection);

    // Initial connected event
    this.sendEventToConnection(connection, 'connected', {
      status: 'connected',
      userId,
      timestamp: new Date().toISOString()
    });

    Logger.info(`[ChatSSE] User ${userId} connected. Active connections for user: ${this.clients.get(userId)!.size}`);

    // Handle connection close
    res.on('close', () => {
      const userConns = this.clients.get(userId);
      if (userConns) {
        userConns.delete(connection);
        if (userConns.size === 0) {
          this.clients.delete(userId);
        }
      }
      Logger.info(`[ChatSSE] User ${userId} connection closed.`);
    });
  }

  /**
   * Dispatch an event to all open connections of a user
   */
  public notifyUser(userId: string, event: string, data: any): void {
    const userConns = this.clients.get(userId);
    if (!userConns || userConns.size === 0) return;

    for (const conn of userConns) {
      try {
        this.sendEventToConnection(conn, event, data);
      } catch (err) {
        Logger.error(`[ChatSSE] Failed to send event to user ${userId}:`, err);
      }
    }
  }

  /**
   * Broadcast new message to recipient and sender
   */
  public broadcastNewMessage(message: MessageDocument, conversation: ConversationDocument): void {
    // 1. Notify the receiver
    this.notifyUser(message.receiverId, 'chat:new_message', {
      message,
      conversation
    });

    // 2. Notify the sender (for multi-tab/device sync)
    this.notifyUser(message.senderId, 'chat:new_message', {
      message,
      conversation
    });
  }

  /**
   * Broadcast read receipts to conversation participants
   */
  public broadcastMessagesRead(conversationId: string, readByUserId: string, targetUserId: string): void {
    this.notifyUser(targetUserId, 'chat:message_read', {
      conversationId,
      readByUserId,
      readAt: new Date().toISOString()
    });
  }

  /**
   * Broadcast conversation updates (e.g. status changes, new preview text)
   */
  public broadcastConversationUpdate(conversation: ConversationDocument): void {
    this.notifyUser(conversation.buyerId, 'chat:conversation_updated', { conversation });
    this.notifyUser(conversation.sellerId, 'chat:conversation_updated', { conversation });
  }

  /**
   * Check if a user currently has an active SSE connection
   */
  public isUserOnline(userId: string): boolean {
    const conns = this.clients.get(userId);
    return !!conns && conns.size > 0;
  }

  private sendEventToConnection(conn: ClientConnection, event: string, data: any): void {
    if (conn.res.writableEnded || conn.res.destroyed) return;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    conn.res.write(payload);
  }

  private sendKeepAlive(): void {
    for (const [userId, conns] of this.clients.entries()) {
      for (const conn of conns) {
        if (conn.res.writableEnded || conn.res.destroyed) {
          conns.delete(conn);
          continue;
        }
        try {
          conn.res.write(': keepalive\n\n');
        } catch {
          conns.delete(conn);
        }
      }
      if (conns.size === 0) {
        this.clients.delete(userId);
      }
    }
  }
}

export const chatRealtimeService = new ChatRealtimeService();
