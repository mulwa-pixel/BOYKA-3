// Complete Deriv WebSocket integration
import { TickData, ContractProposal, ActiveContract } from './types';

type MessageCallback = (data: any) => void;

class DerivWebSocket {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, MessageCallback[]> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private tickSubscriptions: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private appId: string) {}

  async connect(token?: string): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${this.appId}`);
        
        this.ws.onopen = () => {
          console.log('✅ Deriv WebSocket connected');
          this.reconnectAttempts = 0;
          
          if (token) {
            this.authorize(token);
          }
          
          // Resubscribe to all active tick subscriptions
          this.tickSubscriptions.forEach(symbol => {
            this.subscribeTicks(symbol);
          });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        };

        this.ws.onclose = () => {
          console.log('❌ Deriv WebSocket disconnected');
          this.connectionPromise = null;
          this.handleReconnect(token);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private handleReconnect(token?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(token), 2000 * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    // Route messages to subscribers
    if (data.tick) {
      this.emit('tick', data.tick);
    } else if (data.balance) {
      this.emit('balance', data.balance);
    } else if (data.proposal) {
      this.emit('proposal', data.proposal);
    } else if (data.proposal_open_contract) {
      this.emit('contract', data.proposal_open_contract);
    } else if (data.error) {
      this.emit('error', data.error);
    }
  }

  subscribe(event: string, callback: MessageCallback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: MessageCallback) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  send(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  authorize(token: string) {
    this.send({ authorize: token });
  }

  subscribeTicks(symbol: string) {
    this.tickSubscriptions.add(symbol);
    this.send({ ticks: symbol, subscribe: 1 });
  }

  unsubscribeTicks(symbol: string) {
    this.tickSubscriptions.delete(symbol);
    this.send({ forget: symbol });
  }

  getProposal(proposal: {
    symbol: string;
    amount: number;
    contract_type: string;
    duration: number;
    duration_unit: 't' | 'm' | 'h';
    barrier?: string;
  }) {
    this.send({ proposal: 1, ...proposal });
  }

  buyContract(proposal_id: number, price: number) {
    this.send({ buy: proposal_id, price });
  }

  sellContract(contract_id: string, price: number) {
    this.send({ sell: contract_id, price });
  }

  getBalance() {
    this.send({ balance: 1, subscribe: 1 });
  }

  getActiveContracts() {
    this.send({ proposal_open_contract: 1, subscribe: 1 });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connectionPromise = null;
    }
  }
}

export default DerivWebSocket;
