'use client';

import { useState } from 'react';
import { useTradingStore } from '@/store/trading-store';
import DerivWebSocket from '@/lib/deriv-ws';

interface TradingPanelProps {
  ws: DerivWebSocket;
}

export default function TradingPanel({ ws }: TradingPanelProps) {
  const [stake, setStake] = useState(1);
  const [duration, setDuration] = useState(5);
  const [contractType, setContractType] = useState('CALL');
  const [payout, setPayout] = useState(0);
  const { selectedSymbol } = useTradingStore();

  const calculatePayout = () => {
    // Simple payout calculation (Deriv's typical 95% return)
    const payoutAmount = stake * 1.95;
    setPayout(payoutAmount);
  };

  const placeTrade = () => {
    ws.getProposal({
      symbol: selectedSymbol,
      amount: stake,
      contract_type: contractType,
      duration: duration,
      duration_unit: 't'
    });

    // In real implementation, handle proposal response and then buy
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Quick Trade</h2>
      
      <div className="space-y-4">
        {/* Market Selector */}
        <div>
          <label className="text-sm text-gray-400">Market</label>
          <select 
            value={selectedSymbol}
            onChange={(e) => useTradingStore.getState().setSelectedSymbol(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
          >
            <option value="R_10">Volatility 10</option>
            <option value="R_25">Volatility 25</option>
            <option value="R_50">Volatility 50</option>
            <option value="R_75">Volatility 75</option>
            <option value="R_100">Volatility 100</option>
          </select>
        </div>

        {/* Contract Type */}
        <div>
          <label className="text-sm text-gray-400">Contract Type</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setContractType('CALL')}
              className={`p-2 rounded-lg font-bold ${
                contractType === 'CALL' 
                  ? 'bg-[#00ff88] text-black' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              CALL ↗
            </button>
            <button
              onClick={() => setContractType('PUT')}
              className={`p-2 rounded-lg font-bold ${
                contractType === 'PUT' 
                  ? 'bg-[#ff0055] text-white' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              PUT ↘
            </button>
          </div>
        </div>

        {/* Stake */}
        <div>
          <label className="text-sm text-gray-400">Stake ($)</label>
          <input
            type="number"
            value={stake}
            onChange={(e) => {
              setStake(Number(e.target.value));
              calculatePayout();
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            min="1"
            max="100"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm text-gray-400">Duration (ticks)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => {
              setDuration(Number(e.target.value));
              calculatePayout();
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            min="1"
            max="10"
          />
        </div>

        {/* Payout Preview */}
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-400">Potential Payout</p>
          <p className="text-2xl font-bold text-[#00ff88]">
            ${(stake * 1.95).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">Risk/Reward: 1:0.95</p>
        </div>

        {/* Place Trade Button */}
        <button
          onClick={placeTrade}
          className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold py-3 rounded-lg hover:opacity-90 transition"
        >
          PLACE TRADE
        </button>

        {/* Probability Indicator */}
        <div className="text-center text-sm text-gray-400">
          <p>AI Probability: 68%</p>
          <div className="w-full bg-gray-800 h-2 rounded-full mt-1">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-[#00ff88] to-[#ff0055]"
              style={{ width: '68%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
        }
