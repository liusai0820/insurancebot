'use client';

import React, { useRef } from 'react';
import { ArrowLeft, Share2, Download, ShieldCheck } from 'lucide-react';
import { QuoteItem } from '@/types';
import { RATE_TABLE, DEFAULT_PLAN_NAME, DEFAULT_COVERAGE_DEATH, DEFAULT_COVERAGE_MEDICAL, DEFAULT_COVERAGE_HOSPITAL } from '@/constants';

interface ProposalViewProps {
  data: {
    items: QuoteItem[];
    generatedAt: Date;
  };
  onBack: () => void;
}

const ProposalView: React.FC<ProposalViewProps> = ({ data, onBack }) => {
  const { items } = data;
  const totalPremium = items.reduce((acc, item) => acc + (item.basePremium * item.count), 0);
  const date = new Date().toLocaleDateString('zh-CN');

  const proposalRef = useRef<HTMLDivElement>(null);

  const categorizedItems: Record<string, QuoteItem[]> = {};
  items.forEach(item => {
    const key = item.occupation.category.toString();
    if (!categorizedItems[key]) categorizedItems[key] = [];
    categorizedItems[key].push(item);
  });

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5 mr-1" />
          返回修改
        </button>
        <div className="text-sm font-bold text-slate-800">投保建议书 Preview</div>
        <button
          className="text-brand-600 font-medium text-sm flex items-center gap-1"
          onClick={() => alert('功能开发中：您可以直接截图分享')}
        >
          <Share2 className="w-4 h-4" />
          分享
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div ref={proposalRef} className="bg-white rounded-none sm:rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto min-h-[600px]">
          <div className="bg-brand-600 h-2 w-full"></div>

          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-8 h-8 text-brand-600" />
                  <h1 className="text-2xl font-bold text-slate-900">投保建议书</h1>
                </div>
                <p className="text-slate-500 text-sm">生成的日期: {date}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Total Premium</div>
                <div className="text-3xl font-bold text-brand-600">¥{totalPremium.toLocaleString()}</div>
              </div>
            </div>

            <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">保障方案</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">方案名称</span>
                  <span className="font-semibold text-slate-900">{DEFAULT_PLAN_NAME}</span>
                </div>
                <div className="h-px bg-slate-200 my-2"></div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">意外身故/残疾</div>
                    <div className="font-bold text-slate-800">{DEFAULT_COVERAGE_DEATH}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">意外医疗</div>
                    <div className="font-bold text-slate-800">{DEFAULT_COVERAGE_MEDICAL}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">意外住院津贴</div>
                    <div className="font-bold text-slate-800">{DEFAULT_COVERAGE_HOSPITAL}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">职业清单 & 保费明细</h2>
              <div className="space-y-6">
                {Object.keys(categorizedItems)
                  .sort()
                  .map(catKey => {
                    const catItems = categorizedItems[catKey];
                    const rate = RATE_TABLE[Number(catKey)];

                    return (
                      <div key={catKey}>
                        <div className={`flex items-center gap-2 mb-2 pb-1 border-b ${rate?.color?.replace('bg-', 'border-').split(' ')[2] || 'border-slate-200'}`}>
                          <span className={`text-xs px-2 py-0.5 rounded ${rate?.color}`}>{rate?.label}</span>
                          <span className="text-xs text-slate-400">费率: ¥{rate?.price}/人</span>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-slate-400 text-xs">
                              <th className="pb-2 font-medium">职业名称 (代码)</th>
                              <th className="pb-2 font-medium text-right">人数</th>
                              <th className="pb-2 font-medium text-right">小计</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-700">
                            {catItems.map(item => (
                              <tr key={item.id}>
                                <td className="py-1">
                                  <div>{item.occupation.standardName}</div>
                                  <div className="text-[10px] text-slate-400">{item.occupation.code}</div>
                                </td>
                                <td className="py-1 text-right">{item.count}</td>
                                <td className="py-1 text-right font-medium">¥{(item.basePremium * item.count).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed text-justify">
              <p>声明：本建议书仅供参考，不作为最终承保承诺。最终保费与承保结果以保险公司核保通过并出具的正式保单为准。拒保类职业（0类）无法投保本方案。职业分类标准依据《京东安联职业分类表（2019版）》。如有未尽事宜，请联系您的保险顾问。</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" /> 下载/打印
          </button>
          <button
            className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
            onClick={() => alert('确认投保功能将连接至核心系统')}
          >
            确认投保
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
