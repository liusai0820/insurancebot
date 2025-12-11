'use client';

import React, { useState } from 'react';
import { Search, Loader2, Plus, Info, Shield, Hash, Building2 } from 'lucide-react';
import { OccupationResult, RiskCategory } from '@/types';
import { RATE_TABLE } from '@/constants';

interface OccupationSearchProps {
  onSelect: (occupation: OccupationResult) => void;
}

const OccupationSearch: React.FC<OccupationSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OccupationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/classify-occupation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      if (data.results.length === 0) {
        setError('未找到匹配的职业，请尝试更换关键词。');
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (category: RiskCategory) => {
    const item = RATE_TABLE[category];
    return item ? item.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">职业定级查询</h2>
        <p className="text-slate-500 text-sm">输入职业关键词（如：叉车、会计、高空作业），AI自动匹配标准分类表。</p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="请输入职业关键词..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-lg transition-all"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 bg-brand-600 text-white px-4 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '查询'}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-semibold text-slate-500">匹配结果 ({results.length})</span>
              <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">AI智能匹配中</span>
            </div>
            {results.map((res, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-brand-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {res.code}
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {res.industry}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{res.standardName}</h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{res.description}</p>
                  </div>
                  <div className={`flex-shrink-0 ml-3 px-3 py-1 rounded-lg text-sm font-bold border flex flex-col items-center justify-center min-w-[80px] ${getBadgeColor(res.category)}`}>
                    <span>{RATE_TABLE[res.category]?.label.split(' ')[0]}</span>
                    <span className="text-[10px] font-normal opacity-80">{res.category === 0 ? '拒保' : `${res.category}类`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-50">
                  <div className="text-sm flex flex-col">
                    <span className="text-slate-400 text-xs">标准费率</span>
                    <span className="font-semibold text-slate-900 text-base">
                      {res.category === 0 ? '需人工核保' : `¥${RATE_TABLE[res.category]?.price}/人`}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelect(res)}
                    disabled={res.category === 0}
                    className="flex items-center gap-1 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 shadow-sm shadow-brand-100"
                  >
                    <Plus className="w-4 h-4" />
                    {res.category === 0 ? '不可加入' : '加入方案'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!results && !loading && !error && (
          <div className="text-center text-slate-400 mt-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-slate-200" />
            </div>
            <p className="font-medium text-slate-600 mb-1">精准匹配 京东安联职业库</p>
            <p className="text-sm text-slate-400">支持模糊搜索，如"送外卖"自动匹配"收货、送货员"</p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {['叉车', '会计', '货车司机', '高空作业', '外卖'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); handleSearch(); }}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500 hover:border-brand-300 hover:text-brand-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OccupationSearch;
