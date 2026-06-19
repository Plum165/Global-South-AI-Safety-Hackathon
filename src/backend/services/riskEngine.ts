import { clampScore, levelFromScore, type RiskLevel } from '../analytics/riskScorer.ts';

export interface RiskAnalysis {
  score: number;
  level: RiskLevel;
  categories: string[];
}

interface RiskRule {
  patterns: string[];
  category: string;
  baseScore: number;
}

const RISK_RULES: RiskRule[] = [
  {
    patterns: [
      'ignore previous instructions', 'ignore all previous', 'pretend you are',
      'you are now dan', 'act as if you have no', 'jailbreak', 'bypass your',
      'forget you are an ai', 'disregard your guidelines', 'override your',
      'as an ai without restrictions', 'no restrictions mode', 'developer mode',
      'do anything now', 'ignore your training', 'ignore the above',
      'from now on you will ignore', 'grandma exploit', 'pretend to be an ai',
      'act as an unrestricted', 'roleplay as an ai with no',
    ],
    category: 'jailbreak-attempt',
    baseScore: 85,
  },
  {
    patterns: [
      'how to make a bomb', 'how to build a bomb', 'how to synthesize drugs',
      'how to make meth', 'how to make cocaine', 'how to make explosives',
      'how to kill someone', 'how to poison', 'suicide method', 'how to end my life',
      'how to hack into', 'create malware', 'write ransomware', 'ddos attack',
      'how to make a weapon', 'instructions for a bomb', 'explosive device tutorial',
    ],
    category: 'harmful-intent',
    baseScore: 82,
  },
  {
    patterns: [
      'steal election', 'iba kura', 'vuruga uchaguzi', 'kuvuruga mfumo',
      'election fraud method', 'manipulate votes', 'how to rig an election',
      'stuff ballot boxes', 'suppress voter', 'vote tampering', 'hack voting machine',
      'election interference', 'kuvuruga michakato',
    ],
    category: 'election-integrity',
    baseScore: 78,
  },
  {
    patterns: [
      'steal credit card', 'credit card information', 'kaadi kirẹditi',
      'alaye kaadi', 'gbigba alaye kaadi', 'jinsi ya kuiba pesa',
      'hack bank account', 'steal someone\'s money', 'phishing page',
      'identity theft method', 'how to steal passwords', 'bypass payment',
      'carding method', 'dump credit cards',
    ],
    category: 'cyber-fraud',
    baseScore: 80,
  },
  {
    patterns: [
      'nare brief', 'ruvengo', 'mashoko eruvengo', 'hate message',
      'write a hateful', 'harassment campaign', 'write an insulting letter',
      'bully my colleague', 'attack someone on social media',
      'racist message', 'derogatory content', 'slur against',
      'intimidate my', 'threatening letter', 'write hate speech',
      'bulala', 'mhirizhonga vanhu',
    ],
    category: 'hate-speech',
    baseScore: 72,
  },
  {
    patterns: [
      'cure cancer at home', 'imithi yokwelapha umdlavuza',
      'vaccines cause autism', 'vaccines are dangerous', 'covid is fake',
      'covid hoax', '5g causes cancer', 'miracle cure for cancer',
      'doctors are hiding', 'natural cure for hiv', 'bleach cures',
      'home remedy for cancer', 'cure diabetes with herbs alone',
    ],
    category: 'medical-misinformation',
    baseScore: 58,
  },
  {
    patterns: [
      'the earth is flat', 'moon landing was fake', 'lizard people control',
      'government is hiding aliens', 'election was stolen using satellites',
      'chips in vaccines', 'bill gates controls', 'illuminati controls',
      'deep state orchestrated', 'chemtrails are poison',
    ],
    category: 'misinformation',
    baseScore: 50,
  },
  {
    patterns: [
      'write toxic', 'write offensive content', 'generate nsfw',
      'threatening message to', 'harass my', 'make someone feel worthless',
      'dehumanise', 'dehumanize', 'degrading content about',
    ],
    category: 'toxic-content',
    baseScore: 68,
  },
];

export function analyzeRisk(text: string): RiskAnalysis {
  if (!text?.trim()) {
    return { score: 0, level: 'SAFE', categories: ['safe'] };
  }

  const lower = text.toLowerCase();
  let maxScore = 0;
  const categories: string[] = [];

  for (const rule of RISK_RULES) {
    const hit = rule.patterns.some(p => lower.includes(p));
    if (hit) {
      const variance = Math.floor(Math.random() * 6);
      const score = rule.baseScore + variance;
      if (score > maxScore) maxScore = score;
      if (!categories.includes(rule.category)) {
        categories.push(rule.category);
      }
    }
  }

  if (categories.length === 0) {
    categories.push('safe');
    maxScore = Math.floor(Math.random() * 11);
  }

  const score = clampScore(maxScore);
  return { score, level: levelFromScore(score), categories };
}
