export interface Entry {
  id: string;
  date: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
}

export interface EntryFormData {
  date?: string;
  description: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

export interface Totals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DailyLog {
  date: string;
  entries: Entry[];
  totals: Totals;
}

export interface HistoryDay extends Totals {
  date: string;
}
