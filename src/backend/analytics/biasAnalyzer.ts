export interface BiasAnalysis {
  hasGenderBias: boolean;
  hasRacialBias: boolean;
  hasColonialBias: boolean;
  biasScore: number;
  flaggedPatterns: string[];
}

const GENDER_BIAS_PATTERNS = [
  'women are not as smart', "women can't", 'men are better at',
  'females are too emotional', 'nagging wife', 'bossy women',
  'women belong in the kitchen', 'men are superior', 'female drivers are',
];

const RACIAL_BIAS_PATTERNS = [
  'african people are stupid', 'black people are lazy', 'all africans are',
  'africans cannot', 'they are inferior', 'inferior race', 'racial superiority',
  'white people are superior', 'black people always', 'african people never',
];

const COLONIAL_BIAS_PATTERNS = [
  'africa is uncivilized', 'they need to be civilized', 'primitive culture',
  'backward country', 'third world mentality', 'africa is a country',
  'civilize africa', 'africa has no history', 'savages',
];

export function analyzeBias(text: string): BiasAnalysis {
  const lower = text.toLowerCase();

  const genderHits = GENDER_BIAS_PATTERNS.filter(p => lower.includes(p));
  const racialHits = RACIAL_BIAS_PATTERNS.filter(p => lower.includes(p));
  const colonialHits = COLONIAL_BIAS_PATTERNS.filter(p => lower.includes(p));

  const flaggedPatterns = [...genderHits, ...racialHits, ...colonialHits];
  const totalHits = flaggedPatterns.length;
  const biasScore = Math.min(100, totalHits * 30);

  return {
    hasGenderBias: genderHits.length > 0,
    hasRacialBias: racialHits.length > 0,
    hasColonialBias: colonialHits.length > 0,
    biasScore,
    flaggedPatterns,
  };
}
