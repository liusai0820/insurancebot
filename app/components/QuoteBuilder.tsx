'use client';

import React from 'react';
import { Trash2, Users, ArrowRight } from 'lucide-react';
import { QuoteItem } from '@/types';
import { RATE_TABLE } from '@/constants';

interface QuoteBuilderProps {
  items: QuoteItem[];
  onUpdateCount: (id: string, count: number) => void;
  onRemove: (id: string) => void;
  onGenerate: () => void;
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ items, onUpdateCount, onRemove, onGenerate }) => {
  const totalPremium = items.reduce((acc, item) => acc + (item.basePremium * item.count), 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">清单空空如也</h3>
        <p className="text-sm">请先去"职业查询"添加职业到清单</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white p-4 shadow-sm border-b border-slate-100 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-slate-900">保费测算清单</h2>
        <div className="flex justify-between items-end mt-2">
          <div className="text-sm text-slate-500">
            包含 <span className="font-bold text-brand-600">{items.length}</span> 个工种
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">预计总保费</p>
            <p className="text-2xl font-bold text-brand-700">¥{totalPremium.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {items.map((item) => {
          const rateInfo = RATE_TABLE[item.occupation.category];
          return (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-brand-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{item.occupation.standardName}</h4>
                  <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border mt-1 ${rateInfo.color}`}>
                    {rateInfo.label}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">单人保费</span>
                  <span className="font-semibold text-slate-700">¥{item.basePremium}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onUpdateCount(item.id, Math.max(1, item.count - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 active:bg-slate-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.count}
                    onChange={(e) => onUpdateCount(item.id, parseInt(e.target.value) || 1)}
                    className="w-12 text-center bg-transparent font-bold text-slate-900 outline-none"
                  />
                  <button
                    onClick={() => onUpdateCount(item.id, item.count + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 active:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-2 text-right">
                <span className="text-xs text-slate-400">小计: </span>
                <span className="font-bold text-slate-800">¥{(item.basePremium * item.count).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-[72px]">
        <button
          onClick={onGenerate}
          className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-brand-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          生成建议书 <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default QuoteBuilder;
