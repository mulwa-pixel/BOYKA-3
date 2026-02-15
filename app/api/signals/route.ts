import { NextResponse } from 'next/server';
import { AnalyticsEngine } from '@/lib/analytics';
import { SmartSignal } from '@/lib/types';

const analytics = new AnalyticsEngine();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'R_100';

  // Get analytics data
  const data = analytics.getAnalytics(symbol);
  if (!data) {
    return NextResponse.json({ error: 'Insufficient data' }, { status: 400 });
  }

  // Generate smart signal based on multiple factors
  const signal = generateSmartSignal(symbol, data);
  
  return NextResponse.json(signal);
}

function generateSmartSignal(symbol: string, data: any): SmartSignal {
  const factors = [];
  let confidence = 50;
  let direction: 'CALL' | 'PUT' = 'CALL';

  // Factor 1: Recent digit patterns
  const lastFewDigits = data.lastDigits.slice(-5);
  const evenCount = lastFewDigits.filter((d: number) => d % 2 === 0).length;
  
  if (evenCount >= 4) {
    factors.push({ name: 'Even streak detected', impact: 15 });
    confidence += 15;
    direction = 'PUT'; // Mean reversion expectation
  } else if (evenCount <= 1) {
    factors.push({ name: 'Odd streak detected', impact: 15 });
    confidence += 15;
    direction = 'CALL';
  }

  // Factor 2: Probability shift
  const probEven = data.probabilityNext.parity.even;
  if (probEven > 0.6) {
    factors.push({ name: 'Strong even bias', impact: 10 });
    confidence += 10;
    direction = 'PUT';
  } else if (probEven < 0.4) {
    factors.push({ name: 'Strong odd bias', impact: 10 });
    confidence += 10;
    direction = 'CALL';
  }

  // Factor 3: Streak analysis
  if (data.streaks.currentStreak >= 3) {
    factors.push({ 
      name: `${data.streaks.streakType} streak of ${data.streaks.currentStreak}`,
      impact: 20 
    });
    confidence += 20;
    // Streak reversal probability
    direction = data.streaks.streakType === 'even' ? 'PUT' : 'CALL';
  }

  // Factor 4: Over/Under imbalance
  const overRatio = data.overCount / (data.overCount + data.underCount);
  if (overRatio > 0.65) {
    factors.push({ name: 'Strong over bias', impact: 12 });
    confidence += 12;
  } else if (overRatio < 0.35) {
    factors.push({ name: 'Strong under bias', impact: 12 });
    confidence += 12;
  }

  // Cap confidence at 95%
  confidence = Math.min(confidence, 95);

  // Generate reasoning
  const reasoning = factors.map(f => `${f.name} (+${f.impact}%)`);

  return {
    symbol,
    direction,
    confidence,
    reasoning,
    recommendedDuration: 5, // 5 ticks
    expiryTimestamp: Date.now() + 30000, // 30 seconds
    factors
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { symbol, tickData } = body;
  
  // Add tick to analytics
  analytics.addTick(tickData);
  
  return NextResponse.json({ success: true });
}
