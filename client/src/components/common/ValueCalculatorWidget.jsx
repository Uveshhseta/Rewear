import React, { useState, useEffect } from 'react';
import { Calculator, Sparkles, RefreshCw, Info } from 'lucide-react';
import api from '../../api/client';

export const ValueCalculatorWidget = ({ onApplyValue }) => {
  const [category, setCategory] = useState('women');
  const [brand, setBrand] = useState("Levi's");
  const [condition, setCondition] = useState('like_new');
  const [referencePrice, setReferencePrice] = useState(3500);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/listings/calculate-value', {
        category,
        brand,
        condition,
        referencePrice: Number(referencePrice) || 0,
      });
      if (res.data.success) {
        setCalculation(res.data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [category, brand, condition, referencePrice]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/15 shadow-float">
      <div className="flex items-center space-x-2.5 text-forest mb-4">
        <div className="p-2 rounded-xl bg-forest/5">
          <Calculator className="w-5 h-5 text-forest" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-charcoal">Smart Swap Value Estimator</h3>
          <p className="text-xs text-charcoal/60">Rule-based valuation ensuring zero unfair trades</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Input Parameters */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Clothing Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-ivory border border-forest/20 rounded-xl px-3 py-2.5 text-charcoal focus:outline-none focus:border-forest"
            >
              <option value="women">Women's Apparel</option>
              <option value="men">Men's Wardrobe</option>
              <option value="ethnic_wear">Ethnic & Handloom</option>
              <option value="shoes">Footwear & Sneakers</option>
              <option value="accessories">Accessories & Bags</option>
              <option value="kids">Kids & Toddler</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Brand / Maker
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Zara, Nike, Fabindia, Levi's"
              className="w-full text-xs bg-ivory border border-forest/20 rounded-xl px-3 py-2.5 text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Garment Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full text-xs bg-ivory border border-forest/20 rounded-xl px-3 py-2.5 text-charcoal focus:outline-none focus:border-forest"
            >
              <option value="new_with_tags">New with tags (Unworn with original label)</option>
              <option value="like_new">Like new (Worn once or twice, immaculate)</option>
              <option value="good">Good (Light wear, structurally sound)</option>
              <option value="fair">Fair (Visible signs of love and wear)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
              Approx. Original Retail Price (₹ INR)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={referencePrice}
              onChange={(e) => setReferencePrice(e.target.value)}
              className="w-full text-xs bg-ivory border border-forest/20 rounded-xl px-3 py-2.5 text-charcoal focus:outline-none focus:border-forest font-semibold"
            />
          </div>
        </div>

        {/* Calculation Result Display */}
        <div className="bg-ivory-light rounded-2xl p-6 border border-forest/10 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/60">
              Estimated Fair Swap Credit
            </span>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="font-serif text-4xl sm:text-5xl font-extrabold text-forest">
                ₹{calculation ? calculation.estimatedSwapValue.toLocaleString('en-IN') : '...'}
              </span>
              <span className="text-xs text-charcoal/60 font-medium">INR parity</span>
            </div>

            <div className="mt-6 space-y-2.5 pt-4 border-t border-forest/10 text-xs">
              <div className="flex justify-between text-charcoal/80">
                <span>Condition Depreciation:</span>
                <span className="font-semibold text-charcoal">
                  {Math.round((calculation?.conditionFactor || 0.75) * 100)}% preserved
                </span>
              </div>
              <div className="flex justify-between text-charcoal/80">
                <span>Brand Valuation Tier:</span>
                <span className="font-semibold text-charcoal">
                  {Math.round((calculation?.brandFactor || 1) * 100)}% multiplier
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-forest/10 flex items-start space-x-2 text-[11px] text-charcoal/70">
            <Info className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
            <p>
              Values are calculated to facilitate direct cashless trades. Users can always negotiate freely inside the swap chat.
            </p>
          </div>

          {onApplyValue && calculation && (
            <button
              type="button"
              onClick={() => onApplyValue(calculation.estimatedSwapValue)}
              className="mt-4 w-full py-2.5 bg-forest text-white text-xs font-semibold rounded-xl hover:bg-forest-light transition-colors"
            >
              Use This Estimated Value
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

