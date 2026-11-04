import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ValueCalculatorWidget } from '../components/common/ValueCalculatorWidget';

export const CalculatorPage = () => {
  return (
    <div className="min-h-screen bg-ivory-light py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-charcoal/70 hover:text-forest mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fair Trade Algorithm</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-forest">
            Swap Value Calculator
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-2 max-w-xl mx-auto">
            Our documented valuation algorithm calibrates fabric depreciation, condition factors, and brand multipliers to calculate fair trade estimates.
          </p>
        </div>

        <ValueCalculatorWidget />

        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-sm text-xs text-charcoal/80 space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal">How Parity is Calculated</h3>
          <p>
            ReWear uses the formula: <code className="bg-ivory px-2 py-0.5 rounded font-mono font-bold text-forest">Estimated Value = Reference Price × Condition Factor × Brand Factor</code>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="font-bold text-charcoal block mb-1">Condition Multipliers:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-charcoal/70">
                <li>New with tags: 0.90 (90% original value preserved)</li>
                <li>Like new: 0.75 (75% preserved)</li>
                <li>Good condition: 0.55 (55% preserved)</li>
                <li>Fair condition: 0.30 (30% preserved)</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-charcoal block mb-1">Brand Tiers:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-charcoal/70">
                <li>Luxury / Designer: 1.15 multiplier</li>
                <li>Premium High-Street: 1.00 multiplier</li>
                <li>Standard Fast-Fashion: 0.90 multiplier</li>
                <li>Value / Everyday: 0.80 multiplier</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

