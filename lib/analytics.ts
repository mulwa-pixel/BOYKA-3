// Complete probability and analytics engine
import { TickData, DigitAnalytics } from './types';

export class AnalyticsEngine {
  private tickHistory: Map<string, TickData[]> = new Map();
  private maxHistorySize = 1000;

  addTick(tick: TickData) {
    if (!this.tickHistory.has(tick.symbol)) {
      this.tickHistory.set(tick.symbol, []);
    }
    
    const history = this.tickHistory.get(tick.symbol)!;
    history.push(tick);
    
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  getAnalytics(symbol: string): DigitAnalytics | null {
    const history = this.tickHistory.get(symbol);
    if (!history || history.length < 10) return null;

    const frequencies: { [key: number]: number } = {};
    let evenCount = 0, oddCount = 0, overCount = 0, underCount = 0;
    const lastDigits: number[] = [];
    
    // Initialize frequencies
    for (let i = 0; i <= 9; i++) frequencies[i] = 0;

    // Calculate frequencies and counts
    history.forEach(tick => {
      const digit = tick.price % 1 * 100;
      const lastDigit = Math.floor(digit * 10) % 10;
      
      frequencies[lastDigit]++;
      lastDigits.push(lastDigit);
      
      if (lastDigit % 2 === 0) evenCount++;
      else oddCount++;
      
      if (lastDigit > 5) overCount++;
      else underCount++;
    });

    // Detect streaks
    let currentStreak = 1;
    let longestStreak = 1;
    let currentStreakType: 'even' | 'odd' | 'over' | 'under' | null = null;
    
    for (let i = 1; i < lastDigits.length; i++) {
      const prevParity = lastDigits[i-1] % 2 === 0 ? 'even' : 'odd';
      const currParity = lastDigits[i] % 2 === 0 ? 'even' : 'odd';
      
      if (prevParity === currParity) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreakType = currParity;
      } else {
        currentStreak = 1;
      }
    }

    // Calculate probabilities for next tick
    const probabilityNext = {
      digit: {} as { [key: number]: number },
      parity: { even: 0, odd: 0 },
      overUnder: { over: 0, under: 0 }
    };

    const total = history.length;
    for (let i = 0; i <= 9; i++) {
      probabilityNext.digit[i] = frequencies[i] / total;
    }
    
    probabilityNext.parity.even = evenCount / total;
    probabilityNext.parity.odd = oddCount / total;
    probabilityNext.overUnder.over = overCount / total;
    probabilityNext.overUnder.under = underCount / total;

    return {
      frequencies,
      evenCount,
      oddCount,
      overCount,
      underCount,
      streaks: {
        currentStreak,
        longestStreak,
        streakType: currentStreakType
      },
      lastDigits: lastDigits.slice(-20),
      probabilityNext
    };
  }

  getHeatmapData(symbol: string) {
    const analytics = this.getAnalytics(symbol);
    if (!analytics) return null;

    const heatmap = [];
    for (let i = 0; i <= 9; i++) {
      heatmap.push({
        digit: i,
        frequency: analytics.frequencies[i],
        probability: analytics.probabilityNext.digit[i] * 100,
        color: this.getHeatmapColor(analytics.probabilityNext.digit[i])
      });
    }
    return heatmap;
  }

  private getHeatmapColor(probability: number): string {
    if (probability > 0.15) return '#00ff88';
    if (probability > 0.12) return '#667eea';
    if (probability > 0.08) return '#ffaa00';
    return '#ff0055';
  }

  detectPatterns(symbol: string) {
    const history = this.tickHistory.get(symbol);
    if (!history || history.length < 5) return [];

    const patterns = [];
    const lastDigits = history.map(t => Math.floor((t.price % 1 * 1000) % 10));

    // Detect repeating patterns
    for (let length = 2; length <= 4; length++) {
      const recent = lastDigits.slice(-length);
      let occurrences = 0;
      
      for (let i = 0; i <= lastDigits.length - length - 1; i++) {
        const segment = lastDigits.slice(i, i + length);
        if (JSON.stringify(segment) === JSON.stringify(recent)) {
          occurrences++;
        }
      }

      if (occurrences > 1) {
        patterns.push({
          type: 'repeating',
          length,
          pattern: recent,
          occurrences,
          probability: occurrences / (lastDigits.length - length)
        });
      }
    }

    return patterns;
  }
}

export default AnalyticsEngine;
