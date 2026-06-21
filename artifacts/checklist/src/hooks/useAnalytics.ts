import { useState, useEffect, useCallback } from 'react';
import { getAllEvents } from '../lib/analyticsDB';
import { AnalyticsEvent } from '../types';

export interface DailyCompletion {
  date: string;
  rate: number;
  sessions: number;
}

export interface MissedItem {
  text: string;
  kitName: string;
  missCount: number;
}

export interface KitStat {
  kitId: string;
  kitName: string;
  totalSessions: number;
  avgCompletion: number;
}

export interface AnalyticsData {
  consistencyScore: number | null;
  totalSessions: number;
  dailyCompletions: DailyCompletion[];
  topMissedItems: MissedItem[];
  kitStats: KitStat[];
  isLoading: boolean;
  refresh: () => void;
}

function formatDay(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function useAnalytics(): AnalyticsData {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    getAllEvents()
      .then((data) => setEvents(data))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resetEvents = events.filter((e) => e.type === 'reset_session');
  const missEvents = events.filter((e) => e.type === 'miss');

  // Consistency Score = average completion % across all reset sessions
  const consistencyScore =
    resetEvents.length === 0
      ? null
      : Math.round(
          resetEvents.reduce((acc, e) => {
            const rate =
              (e.totalItems ?? 0) > 0
                ? ((e.checkedItems ?? 0) / e.totalItems!) * 100
                : 0;
            return acc + rate;
          }, 0) / resetEvents.length
        );

  // Daily completions — group reset events by day, keep last 14 unique days
  const dailyMap = new Map<string, { total: number; count: number }>();
  resetEvents.forEach((e) => {
    const day = formatDay(e.timestamp);
    const rate =
      (e.totalItems ?? 0) > 0
        ? ((e.checkedItems ?? 0) / e.totalItems!) * 100
        : 0;
    const existing = dailyMap.get(day) ?? { total: 0, count: 0 };
    dailyMap.set(day, {
      total: existing.total + rate,
      count: existing.count + 1,
    });
  });

  const dailyCompletions: DailyCompletion[] = Array.from(dailyMap.entries())
    .slice(-14)
    .map(([date, { total, count }]) => ({
      date,
      rate: Math.round(total / count),
      sessions: count,
    }));

  // Top missed items — aggregate miss events by item text per kit
  const missMap = new Map<string, { text: string; kitName: string; count: number }>();
  missEvents.forEach((e) => {
    if (!e.itemText) return;
    const key = `${e.kitId}::${e.itemText.toLowerCase()}`;
    const existing = missMap.get(key) ?? { text: e.itemText, kitName: e.kitName, count: 0 };
    missMap.set(key, { ...existing, count: existing.count + 1 });
  });

  const topMissedItems: MissedItem[] = Array.from(missMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(({ text, kitName, count }) => ({ text, kitName, missCount: count }));

  // Per-kit stats
  const kitMap = new Map<string, { kitName: string; totalRate: number; count: number }>();
  resetEvents.forEach((e) => {
    const rate =
      (e.totalItems ?? 0) > 0
        ? ((e.checkedItems ?? 0) / e.totalItems!) * 100
        : 0;
    const existing = kitMap.get(e.kitId) ?? {
      kitName: e.kitName,
      totalRate: 0,
      count: 0,
    };
    kitMap.set(e.kitId, {
      kitName: e.kitName,
      totalRate: existing.totalRate + rate,
      count: existing.count + 1,
    });
  });

  const kitStats: KitStat[] = Array.from(kitMap.entries()).map(
    ([kitId, { kitName, totalRate, count }]) => ({
      kitId,
      kitName,
      totalSessions: count,
      avgCompletion: Math.round(totalRate / count),
    })
  );

  return {
    consistencyScore,
    totalSessions: resetEvents.length,
    dailyCompletions,
    topMissedItems,
    kitStats,
    isLoading,
    refresh,
  };
}
