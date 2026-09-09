import { Response } from 'express';

export class SSEService {
  private clients: Set<Response> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Send keep-alive every 25 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 25000);
  }

  public addClient(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering
    res.flushHeaders();

    this.clients.add(res);

    // Initial connection acknowledgment
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to AltMedi Live Stock Stream', activeClients: this.clients.size })}\n\n`);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(event: string, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  private sendHeartbeat(): void {
    for (const client of this.clients) {
      try {
        client.write(': heartbeat\n\n');
      } catch {
        this.clients.delete(client);
      }
    }
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}

export const sseService = new SSEService();
