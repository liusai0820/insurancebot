'use client';

import React, { useState } from 'react';
import OccupationSearch from '@/app/components/OccupationSearch';
import QuoteBuilder from '@/app/components/QuoteBuilder';
import ProposalView from '@/app/components/ProposalView';
import { QuoteItem, ViewState, OccupationResult } from '@/types';

export default function Home() {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [viewState, setViewState] = useState<ViewState>('search');
  const [proposalData, setProposalData] = useState<any>(null);

  const handleAddOccupation = (occupation: OccupationResult) => {
    const basePremium = occupation.category * 100;
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      occupation,
      count: 1,
      basePremium,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateCount = (id: string, count: number) => {
    setItems(items.map(item => item.id === id ? { ...item, count } : item));
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleGenerate = () => {
    setProposalData({ items, generatedAt: new Date() });
    setViewState('proposal');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <div className="w-1/2 border-r border-slate-200">
        {viewState === 'search' && (
          <OccupationSearch onSelect={handleAddOccupation} />
        )}
      </div>
      <div className="w-1/2">
        {viewState === 'search' && (
          <QuoteBuilder
            items={items}
            onUpdateCount={handleUpdateCount}
            onRemove={handleRemove}
            onGenerate={handleGenerate}
          />
        )}
        {viewState === 'proposal' && proposalData && (
          <ProposalView
            data={proposalData}
            onBack={() => setViewState('search')}
          />
        )}
      </div>
    </div>
  );
}
