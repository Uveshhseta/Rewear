/**
 * ValueCalculatorService
 * Calculates estimated swap values and compares items for fair trade matching.
 */

// Condition depreciation factors
const CONDITION_FACTORS = {
  new_with_tags: 0.90,
  like_new: 0.75,
  good: 0.55,
  fair: 0.30,
};

// Brand tier multipliers (calibrated estimates)
const BRAND_TIERS = {
  luxury: {
    brands: ['gucci', 'prada', 'louis vuitton', 'burberry', 'sabyasachi', 'manish malhotra', 'tarun tahiliani', 'dior', 'chanel', 'balenciaga'],
    factor: 1.15,
  },
  premium: {
    brands: ['zara', 'mango', 'massimo dutti', 'tommy hilfiger', 'calvin klein', 'levis', "levi's", 'nike', 'adidas', 'fabindia', 'anita dongre', 'ralph lauren', 'superdry'],
    factor: 1.00,
  },
  standard: {
    brands: ['h&m', 'uniqlo', 'marks & spencer', 'gap', 'puma', 'westside', 'w for woman', 'aurelia', 'biba', 'allen solly', 'van heusen', 'peter england', 'jack & jones'],
    factor: 0.90,
  },
  value: {
    brands: ['max', 'pantaloons', 'zudio', 'roadster', 'fame forever', 'hrx'],
    factor: 0.80,
  },
};

// Category baseline reference values (used when original retail price is missing or unstated)
const CATEGORY_DEFAULT_REFS = {
  women: 2200,
  men: 2000,
  ethnic_wear: 3500,
  shoes: 2800,
  accessories: 1400,
  kids: 1200,
};

/**
 * Identify brand factor from brand string
 */
function getBrandFactor(brandName = '') {
  const normalized = brandName.toLowerCase().trim();
  if (!normalized) return 0.95;

  for (const tier of Object.values(BRAND_TIERS)) {
    if (tier.brands.some((b) => normalized.includes(b))) {
      return tier.factor;
    }
  }
  return 0.95; // default artisan / unlisted factor
}

/**
 * Calculate single item estimated swap value
 */
function calculateItemSwapValue({ referencePrice, condition, category, brand }) {
  const baseRef = Number(referencePrice) > 0 ? Number(referencePrice) : (CATEGORY_DEFAULT_REFS[category] || 2000);
  const conditionFactor = CONDITION_FACTORS[condition] || 0.60;
  const brandFactor = getBrandFactor(brand);

  const rawEstimate = baseRef * conditionFactor * brandFactor;
  // Round to nearest 10 INR
  const roundedValue = Math.max(50, Math.round(rawEstimate / 10) * 10);

  return {
    referencePrice: baseRef,
    conditionFactor,
    brandFactor,
    estimatedSwapValue: roundedValue,
  };
}

/**
 * Compare two items and evaluate fairness
 */
function compareSwapValues(offeredValue, requestedValue) {
  const val1 = Number(offeredValue) || 0;
  const val2 = Number(requestedValue) || 0;

  const absoluteDiff = Math.abs(val1 - val2);
  const higherVal = Math.max(val1, val2);
  const percentageDiff = higherVal > 0 ? Math.round((absoluteDiff / higherVal) * 100) : 0;

  let fairnessMatch = 'equitable';
  let message = 'Equitable Swap: Values are very closely matched (within 15%).';

  if (percentageDiff <= 15) {
    fairnessMatch = 'equitable';
    message = 'Equitable Swap: Highly balanced exchange with balanced perceived value.';
  } else if (percentageDiff <= 30) {
    fairnessMatch = 'fair';
    message = 'Fair Swap: Minor difference in value (within 30%). Good candidates for direct trade.';
  } else {
    fairnessMatch = 'variance';
    message = 'Value Variance: Greater than 30% difference. Recommended to negotiate or bundle.';
  }

  return {
    offeredValue: val1,
    requestedValue: val2,
    absoluteDifference: absoluteDiff,
    percentageDifference: percentageDiff,
    fairnessMatch,
    message,
  };
}

module.exports = {
  CONDITION_FACTORS,
  BRAND_TIERS,
  CATEGORY_DEFAULT_REFS,
  getBrandFactor,
  calculateItemSwapValue,
  compareSwapValues,
};

