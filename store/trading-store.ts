// Zustand store for complete app state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  DerivConnection, 
  TickData, 
  ActiveContract, 
  BotStrategy,
  SmartSignal 
} from '@/lib/types';

interface TradingStore {
  // Connection
  connection: DerivConnection;
  setConnection: (conn: Partial<DerivConnection>) => void;
  
  // Market data
  ticks: Map<string, TickData[]>;
  addTick: (symbol: string, tick: TickData) => void;
  
  // Balance
  balance: number;
  setBalance: (balance: number) => void;
  
  // Contracts
  activeContracts: ActiveContract[];
  addContract: (contract: ActiveContract) => void;
  updateContract: (contractId: string, updates: Partial<ActiveContract>) => void;
  removeContract: (contractId: string) => void;
  
  // Bots
  bots: BotStrategy[];
  addBot: (bot: BotStrategy) => void;
  updateBot: (botId: string, updates: Partial<BotStrategy>) => void;
  removeBot: (botId: string) => void;
  
  // Signals
  signals: Map<string, SmartSignal>;
  setSignal: (symbol: string, signal: SmartSignal) => void;
  
  // UI state
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  chartLayout: '1' | '2' | '4';
  setChartLayout: (layout: '1' | '2' | '4') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useTradingStore = create<TradingStore>()(
  persist(
    (set) => ({
      // Connection
      connection: {
        isConnected: false,
        appId: '',
        accountType: 'demo'
      },
      setConnection: (conn) => 
        set((state) => ({ 
          connection: { ...state.connection, ...conn } 
        })),

      // Market data
      ticks: new Map(),
      addTick: (symbol, tick) => 
        set((state) => {
          const newTicks = new Map(state.ticks);
          if (!newTicks.has(symbol)) {
            newTicks.set(symbol, []);
          }
          const ticks = newTicks.get(symbol)!;
          ticks.push(tick);
          if (ticks.length > 100) ticks.shift();
          newTicks.set(symbol, [...ticks]);
          return { ticks: newTicks };
        }),

      // Balance
      balance: 10000,
      setBalance: (balance) => set({ balance }),

      // Contracts
      activeContracts: [],
      addContract: (contract) =>
        set((state) => ({
          activeContracts: [...state.activeContracts, contract]
        })),
      updateContract: (contractId, updates) =>
        set((state) => ({
          activeContracts: state.activeContracts.map(c =>
            c.contractId === contractId ? { ...c, ...updates } : c
          )
        })),
      removeContract: (contractId) =>
        set((state) => ({
          activeContracts: state.activeContracts.filter(c => c.contractId !== contractId)
        })),

      // Bots
      bots: [],
      addBot: (bot) =>
        set((state) => ({ bots: [...state.bots, bot] })),
      updateBot: (botId, updates) =>
        set((state) => ({
          bots: state.bots.map(b => b.id === botId ? { ...b, ...updates } : b)
        })),
      removeBot: (botId) =>
        set((state) => ({ bots: state.bots.filter(b => b.id !== botId) })),

      // Signals
      signals: new Map(),
      setSignal: (symbol, signal) =>
        set((state) => {
          const newSignals = new Map(state.signals);
          newSignals.set(symbol, signal);
          return { signals: newSignals };
        }),

      // UI state
      selectedSymbol: 'R_100',
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      chartLayout: '1',
      setChartLayout: (layout) => set({ chartLayout: layout }),
      theme: 'dark',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'trading-storage',
      partialize: (state) => ({
        connection: state.connection,
        bots: state.bots,
        theme: state.theme
      })
    }
  )
);
