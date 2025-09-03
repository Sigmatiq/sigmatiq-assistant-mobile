// API Types
export interface AssistantResponse {
  ok: boolean;
  answer: string;
  provider?: string;
  intent?: string;
  data?: any;
  chart?: {
    type: string;
    symbol: string;
    data: any[];
  };
}

export interface ScreenerRequest {
  preset_id?: string;
  watchlist_id?: string;
  timeframe: 'day' | 'hour' | '5m';
  cap: number;
  target: {
    kind: 'indicator' | 'indicator_set' | 'strategy';
    id: string;
    params?: Record<string, any>;
    rules?: Array<{
      column: string;
      op: '>' | '<' | '=' | '>=' | '<=';
      value: number;
    }>;
  };
}

export interface ScreenerResponse {
  ok: boolean;
  matched: string[];
  evaluated: number;
  summary: string;
  results?: Array<{
    symbol: string;
    values: Record<string, number>;
  }>;
}