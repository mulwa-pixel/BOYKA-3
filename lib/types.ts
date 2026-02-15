// Core types for BOYKA 3
export interface DerivConnection {
  isConnected: boolean;
  appId: string;
  token?: string;
  accountType: 'demo' | 'real';
}

export interface TickData {
  symbol: string;
  price: number;
  timestamp: number;
  digit: number;
  parity: 'even' | 'odd';
  overUnder: 'over' | 'under';
}

export interface ContractProposal {
  id: string;
  symbol: string;
  stake: number;
  contractType: 'CALL' | 'PUT' | 'DIGIT_MATCH' | 'DIGIT_DIFF';
  duration: number;
  barrier?: number;
  payout?: number;
  probability?: number;
}

export interface ActiveContract {
  contractId: string;
  symbol: string;
  entryPrice: number;
  currentPrice: number;
  stake: number;
  potentialPayout: number;
  profitLoss: number;
  entryTime: number;
  expiryTime: number;
  status: 'open' | 'won' | 'lost' | 'sold';
}

export interface DigitAnalytics {
  frequencies: { [key: number]: number };
  evenCount: number;
  oddCount: number;
  overCount: number;
  underCount: number;
  streaks: {
    currentStreak: number;
    longestStreak: number;
    streakType: 'even' | 'odd' | 'over' | 'under' | null;
  };
  lastDigits: number[];
  probabilityNext: {
    digit: { [key: number]: number };
    parity: { even: number; odd: number };
    overUnder: { over: number; under: number };
  };
}

export interface BotStrategy {
  id: string;
  name: string;
  symbol: string;
  conditions: BotCondition[];
  actions: BotAction[];
  riskRules: RiskRule[];
  status: 'running' | 'stopped' | 'paused';
  performance: {
    totalTrades: number;
    wins: number;
    losses: number;
    profitLoss: number;
  };
}

export interface BotCondition {
  type: 'digit' | 'parity' | 'overUnder' | 'rsi' | 'trend';
  operator: 'equals' | 'greater' | 'less' | 'streak';
  value: any;
}

export interface BotAction {
  type: 'CALL' | 'PUT' | 'DIGIT_MATCH' | 'DIGIT_DIFF';
  stake: number;
  stakeType: 'fixed' | 'martingale' | 'percentage';
  duration: number;
}

export interface RiskRule {
  type: 'maxLoss' | 'maxTrades' | 'stopLoss' | 'takeProfit';
  value: number;
  enabled: boolean;
}

export interface SmartSignal {
  symbol: string;
  direction: 'CALL' | 'PUT';
  confidence: number;
  reasoning: string[];
  recommendedDuration: number;
  expiryTimestamp: number;
  factors: {
    name: string;
    impact: number;
  }[];
}
