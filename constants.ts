import { RateTableItem, RiskCategory } from './types';

export const RATE_TABLE: Record<number, RateTableItem> = {
  [RiskCategory.CLASS_1]: { category: RiskCategory.CLASS_1, price: 160, label: '1类 (低风险)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  [RiskCategory.CLASS_2]: { category: RiskCategory.CLASS_2, price: 240, label: '2类 (低风险)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  [RiskCategory.CLASS_3]: { category: RiskCategory.CLASS_3, price: 380, label: '3类 (中风险)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  [RiskCategory.CLASS_4]: { category: RiskCategory.CLASS_4, price: 650, label: '4类 (中高风险)', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  [RiskCategory.CLASS_5]: { category: RiskCategory.CLASS_5, price: 1200, label: '5类 (高风险)', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  [RiskCategory.CLASS_6]: { category: RiskCategory.CLASS_6, price: 2000, label: '6类 (特高风险)', color: 'bg-red-100 text-red-800 border-red-200' },
  [RiskCategory.REJECTED]: { category: RiskCategory.REJECTED, price: 0, label: '拒保/人工核保', color: 'bg-gray-200 text-gray-600 border-gray-300' },
};

export const DEFAULT_PLAN_NAME = "企业安心保 - 团体意外险方案 A";
export const DEFAULT_COVERAGE_DEATH = "500,000";
export const DEFAULT_COVERAGE_MEDICAL = "50,000";
export const DEFAULT_COVERAGE_HOSPITAL = "100/天";
