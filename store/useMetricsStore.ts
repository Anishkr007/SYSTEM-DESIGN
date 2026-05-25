import { create } from "zustand";

export interface LiveMetrics {
  qps: number;
  throughputMB: number;
  p99Latency: number;
  cacheHitPercent: number;
  activeConnections: number;
  dbLoadPercent: number;
  queueDepth: number;
  errorRatePercent: number;
}

export interface MetricsState {
  isOpen: boolean;
  togglePanel: () => void;
  metrics: LiveMetrics;
  history: Record<keyof LiveMetrics, number[]>; // Keeps last 20 points for sparklines
  updateMetrics: () => void;
}

const generateInitialMetrics = (): LiveMetrics => ({
  qps: 1250,
  throughputMB: 45.2,
  p99Latency: 120,
  cacheHitPercent: 88,
  activeConnections: 15400,
  dbLoadPercent: 45,
  queueDepth: 350,
  errorRatePercent: 0.1,
});

const generateInitialHistory = (initial: LiveMetrics) => {
  const hist: any = {};
  for (const key in initial) {
    hist[key] = Array(20).fill(initial[key as keyof LiveMetrics]);
  }
  return hist as Record<keyof LiveMetrics, number[]>;
};

export const useMetricsStore = create<MetricsState>((set, get) => ({
  isOpen: false,
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  
  metrics: generateInitialMetrics(),
  history: generateInitialHistory(generateInitialMetrics()),

  updateMetrics: () => {
    set((state) => {
      const { metrics, history } = state;
      const now = Date.now();
      
      const newMetrics: LiveMetrics = {
        qps: Math.max(0, 1250 + Math.sin(now / 2000) * 200 + (Math.random() - 0.5) * 50),
        throughputMB: Math.max(0, 45 + Math.sin(now / 3000) * 15 + (Math.random() - 0.5) * 2),
        p99Latency: Math.max(10, 120 + Math.sin(now / 5000) * 40 + (Math.random() - 0.5) * 10),
        cacheHitPercent: Math.min(100, Math.max(0, 88 + Math.sin(now / 10000) * 5 + (Math.random() - 0.5) * 2)),
        activeConnections: Math.max(0, 15400 + Math.sin(now / 4000) * 1000 + (Math.random() - 0.5) * 200),
        dbLoadPercent: Math.min(100, Math.max(0, 45 + Math.sin(now / 2000) * 20 + (Math.random() - 0.5) * 5)),
        queueDepth: Math.max(0, 350 + Math.sin(now / 1500) * 150 + (Math.random() - 0.5) * 30),
        errorRatePercent: Math.max(0, 0.1 + (Math.random() > 0.95 ? Math.random() * 0.5 : 0)),
      };

      const newHistory: any = {};
      for (const key in newMetrics) {
        const k = key as keyof LiveMetrics;
        newHistory[k] = [...history[k].slice(1), newMetrics[k]];
      }

      return {
        metrics: newMetrics,
        history: newHistory,
      };
    });
  }
}));
