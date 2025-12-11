export enum RiskCategory {
  CLASS_1 = 1,
  CLASS_2 = 2,
  CLASS_3 = 3,
  CLASS_4 = 4,
  CLASS_5 = 5,
  CLASS_6 = 6,
  REJECTED = 0,
}

export interface OccupationResult {
  code: string;
  industry: string;
  standardName: string;
  category: RiskCategory;
  description?: string;
  confidenceScore?: number;
}

export interface QuoteItem {
  id: string;
  occupation: OccupationResult;
  count: number;
  basePremium: number;
}

export interface RateTableItem {
  category: RiskCategory;
  price: number;
  label: string;
  color: string;
}

export type ViewState = 'search' | 'quote' | 'proposal';
