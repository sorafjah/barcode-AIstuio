export enum AppState {
  IDLE = 'IDLE',       // Initial start screen
  SCANNING = 'SCANNING', // Camera active, scanning items
  PAYMENT = 'PAYMENT',   // Final total screen
}

export interface ScanItem {
  id: string;
  code: string;
  name: string;
  price: number;
  timestamp: number;
}
