export type DetectedLanguage =
  | 'english' | 'swahili' | 'zulu' | 'xhosa'
  | 'sesotho' | 'afrikaans' | 'amharic' | 'shona'
  | 'yoruba' | 'unknown';

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  swahili: [
    'jinsi', 'kura', 'uchaguzi', 'kilimo', 'habari', 'asante', 'karibu',
    'mbinu', 'mahindi', 'vijiji', 'mfumo', 'nashindwa', 'kukusaidia',
    'ninataka', 'inawezekana', 'lazima', 'pamoja', 'nyumbani', 'mwaka',
    'nchini', 'maji', 'watu', 'serikali', 'barabara', 'shule', 'hospitali',
    'chakula', 'afya', 'elimu', 'biashara', 'pesa', 'fedha', 'haki',
  ],
  zulu: [
    'imithi', 'umdlavuza', 'ekhaya', 'ngifuna', 'siyabonga', 'isizulu',
    'ukuthula', 'ngobuhle', 'ukukhuluma', 'ngikhona', 'ukwelapha',
    'indlela', 'amandla', 'isizwe', 'ngoba', 'lapho', 'uma', 'noma',
    'abantu', 'umuntu', 'izinto', 'isikhathi', 'uhlelo', 'ukubona',
    'thina', 'yena', 'bona', 'wena', 'mina',
  ],
  xhosa: [
    'ndifuna', 'enkosi', 'isixhosa', 'molo', 'hawu', 'umhlaba',
    'ndiyakuthanda', 'umntu', 'ixesha', 'ubuntu', 'ndixelele',
    'ndicinga', 'ubomi', 'usapho', 'amandla', 'uthando',
    'ndim', 'wena', 'yena', 'thina', 'nina',
  ],
  sesotho: [
    'batho', 'ntate', 'sesotho', 'khotso', 'moshemane', 'mosali',
    'ntlo', 'setso', 'morena', 'mohlanka', 'lefatshe', 'bohle',
    'pelo', 'toro', 'ho bua', 'nna', 'wena', 'bona', 'rona',
    'monate', 'bohlokoa', 'molimo', 'lerato',
  ],
  afrikaans: [
    'skryf', 'nare', 'kollega', 'sosiale', 'aanval', 'sleg',
    'afrikaans', 'baie', 'jou', 'ons', 'hulle', 'hierdie',
    'deur', 'mense', 'land', 'werk', 'groot', 'nuwe', 'moet',
    'haar', 'hul', 'dit', 'ek kan', 'ek wil', 'ons kan',
    'aanlyn', 'rekenaar', 'telefoon',
  ],
  shona: [
    'ruvengo', 'mashoko', 'mhirizhonga', 'vanhu', 'ndinoda', 'chii',
    'musha', 'nyika', 'mwari', 'zvino', 'kunze', 'pano', 'mhuri',
    'vana', 'baba', 'mai', 'mukoma', 'munin', 'zvinhu', 'zvose',
    'kana', 'asi', 'uye', 'handikwanisi', 'handikwanise',
  ],
  yoruba: [
    'bawo', 'kaadi', 'yoruba', 'ilu', 'emi', 'ayelujara',
    'owo', 'orisun', 'ise', 'eniyan', 'orun', 'ile', 'oko',
    'aya', 'tabi', 'nitori', 'gbogbo', 'oun', 'awon',
    'ibeere', 'idahun', 'igba', 'ni', 'pe', 'fun',
  ],
  english: [
    'the', 'and', 'are', 'how', 'what', 'this', 'with', 'that',
    'your', 'from', 'they', 'have', 'been', 'their', 'there',
    'about', 'would', 'could', 'should', 'please', 'help', 'want',
    'need', 'like', 'just', 'know', 'make', 'time', 'very', 'when',
    'only', 'some', 'more', 'which', 'does', 'into', 'than',
  ],
};

function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[\\s,!?.;:'"()\\[\\]{}])${escaped}(?=$|[\\s,!?.;:'"()\\[\\]{}])`, 'i');
    return score + (re.test(lower) ? 1 : 0);
  }, 0);
}

export function detectLanguage(text: string): DetectedLanguage {
  if (!text?.trim()) return 'unknown';

  // Amharic: Ethiopic Unicode block
  if (/[ሀ-፿]/.test(text)) return 'amharic';

  let best: DetectedLanguage = 'english';
  let bestScore = 0;

  for (const [lang, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
    const raw = scoreKeywords(text, keywords);
    // Boost non-English languages so a single distinctive hit wins
    const boosted = lang === 'english' ? raw : raw * 2.5;
    if (boosted > bestScore) {
      bestScore = boosted;
      best = lang as DetectedLanguage;
    }
  }

  return best;
}
