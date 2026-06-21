export interface Item {
  id: string;
  text: string;
  checked: boolean;
}

export interface Kit {
  id: string;
  name: string;
  items: Item[];
}

export type AnalyticsEventType = 'check' | 'reset_session' | 'miss';

export interface AnalyticsEvent {
  id?: number;
  type: AnalyticsEventType;
  kitId: string;
  kitName: string;
  itemId?: string;
  itemText?: string;
  totalItems?: number;
  checkedItems?: number;
  timestamp: number;
}
