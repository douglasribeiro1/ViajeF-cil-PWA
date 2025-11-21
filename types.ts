
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  LOGISTICS = 'LOGISTICS',
  EXPENSES = 'EXPENSES'
}

export interface Destination {
  id: string;
  name: string;
}

export interface SuggestionItem {
  day: number;
  activity: string;
  location: string;
  estimatedCost: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
}

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  description: string;
  location?: string;
  cost?: number;
  completed: boolean;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string; // ISO string
  description: string;
  price?: number;
  attachments?: Attachment[];
}

export interface Accommodation {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  address: string;
  reservationCode?: string;
  price?: number;
  attachments?: Attachment[];
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  date: string;
  method: string; // Uber, Train, Bus
  price?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number; // Always in BRL (Real)
  date: string;
  category: 'Alimentação' | 'Transporte' | 'Compras' | 'Lazer' | 'Hospedagem' | 'Voo' | 'Outros';
  // Foreign Currency Support
  isForeign?: boolean;
  foreignAmount?: number;
  currencySymbol?: string; // e.g., "USD", "EUR", "$"
  exchangeRate?: number;
}

export interface Trip {
  id: string;
  name: string; // Trip Name (e.g., "Eurotrip 2025")
  destinations: Destination[];
  startDate: string;
  endDate: string;
  budget: number;
  // Default currency settings for the trip
  foreignCurrency?: string;
  defaultExchangeRate?: number;
  
  flights: Flight[];
  accommodations: Accommodation[];
  transfers: Transfer[];
  expenses: Expense[];
  activities: Activity[];
}
