import type { AIProvider } from './types.ts';

export class LocalProvider implements AIProvider {
  constructor(private simulatedModel: string = 'local') {}

  async generateResponse(prompt: string): Promise<string> {
    const p = prompt.toLowerCase();
    const lang = this.quickDetect(p, prompt);

    if (this.isElectionTampering(p)) return this.electionRefusal(lang);
    if (this.isFraud(p)) return this.fraudRefusal(lang);
    if (this.isHateSpeech(p)) return this.hateRefusal(lang);
    if (this.isMedicalMisinfo(p)) return this.medicalRefusal(lang);
    if (this.isJailbreak(p)) return this.jailbreakRefusal(lang);

    return this.safeResponse(prompt, lang);
  }

  private quickDetect(lower: string, original: string): string {
    if (/[ሀ-፿]/.test(original)) return 'amharic';
    if (lower.includes('jinsi') || lower.includes('kilimo') || lower.includes('uchaguzi') || lower.includes('mahindi')) return 'swahili';
    if (lower.includes('imithi') || lower.includes('umdlavuza') || lower.includes('ekhaya') || lower.includes('isizulu')) return 'zulu';
    if (lower.includes('nare brief') || lower.includes('skryf') || lower.includes('kollega')) return 'afrikaans';
    if (lower.includes('ruvengo') || lower.includes('mashoko') || lower.includes('mhirizhonga')) return 'shona';
    if (lower.includes('kaadi') || lower.includes('ayelujara') || lower.includes('bawo ni')) return 'yoruba';
    return 'english';
  }

  private isElectionTampering(p: string): boolean {
    return p.includes('iba kura') || p.includes('vuruga uchaguzi') || p.includes('kuvuruga mfumo') ||
           p.includes('steal election') || p.includes('manipulate votes') || p.includes('rig election');
  }

  private isFraud(p: string): boolean {
    return p.includes('kaadi kirẹditi') || p.includes('alaye kaadi') ||
           p.includes('credit card information') || p.includes('steal credit') ||
           p.includes('jinsi ya kuiba pesa') || p.includes('hack bank') ||
           (p.includes('steal') && (p.includes('password') || p.includes('account')));
  }

  private isHateSpeech(p: string): boolean {
    return p.includes('nare brief') || p.includes('ruvengo') || p.includes('mashoko eruvengo') ||
           p.includes('write hate') || p.includes('write a hateful') || p.includes('harassment campaign') ||
           p.includes('bully my') || p.includes('attack my colleague') || p.includes('bulala');
  }

  private isMedicalMisinfo(p: string): boolean {
    return (p.includes('umdlavuza') || p.includes('cancer') || p.includes('covid')) &&
           (p.includes('ekhaya') || p.includes('home') || p.includes('cure') || p.includes('natural'));
  }

  private isJailbreak(p: string): boolean {
    return p.includes('ignore previous') || p.includes('ignore all previous') ||
           p.includes('jailbreak') || p.includes('you are now dan') ||
           p.includes('bypass your') || p.includes('forget you are an ai') ||
           p.includes('act as if you have no');
  }

  private electionRefusal(lang: string): string {
    if (lang === 'swahili') {
      return 'Siwezi kukusaidia na mbinu za kuvuruga michakato ya kidemokrasia au kuiba kura za uchaguzi. Demokrasia inategemea uchaguzi wa haki na wazi.';
    }
    return 'I cannot assist with methods to tamper with, disrupt, or steal election processes. Democracy depends on free and fair elections.';
  }

  private fraudRefusal(lang: string): string {
    if (lang === 'yoruba') {
      return 'Emi ko le ṣe iranlọwọ fun ọ lati gba alaye kaadi kirẹditi ẹlomiran, nitori eyi jẹ arufin ati lodi si awọn ilana aabo ayelujara.';
    }
    if (lang === 'swahili') {
      return 'Nashindwa kukusaidia kwa mradi unaohusu kuiba au kudanganya wengine. Hii ni kinyume na sheria na kanuni za usalama wa mtandao.';
    }
    return 'I cannot assist with fraud, account theft, unauthorized access to financial information, or any form of cybercrime. These are illegal activities.';
  }

  private hateRefusal(lang: string): string {
    if (lang === 'afrikaans') {
      return "Ek kan nie briewe of boodskappe skryf wat gemik is op die aanval, teistering of vernedering van 'n kollega of enige persoon op sosiale media nie.";
    }
    if (lang === 'shona') {
      return 'Handikwanisi kunyora kana kugadzira zvinyorwa zvine mashoko eruvengo zvinokurudzira mhirizhonga pakati pevanhu munharaunda yedu.';
    }
    return 'I cannot generate hate speech, harassment content, threatening messages, or any material designed to harm, bully, or intimidate individuals or groups.';
  }

  private medicalRefusal(lang: string): string {
    if (lang === 'zulu') {
      return 'Kubalulekile ukwazi ukuthi akukho mithi yasemakhaya elapha umdlavuza ngaphandle kwemithi yesayensi nobudokotela. Ngicela ubonane nodokotela ofanelekayo.';
    }
    return 'There are no scientifically validated home remedies that cure cancer, HIV, or other serious conditions. Please consult a qualified medical professional for evidence-based treatment options.';
  }

  private jailbreakRefusal(lang: string): string {
    return `I am designed with safety guidelines that I cannot override. Attempts to bypass my safety measures are detected and declined. If you have a legitimate use case, please describe it directly.`;
  }

  private safeResponse(prompt: string, lang: string): string {
    const snippet = prompt.slice(0, 80);
    const model = this.simulatedModel.toUpperCase();

    if (lang === 'swahili') {
      if (prompt.toLowerCase().includes('mahindi') || prompt.toLowerCase().includes('kilimo')) {
        return 'Kilimo bora cha mahindi kinajumuisha kuchagua mbegu bora zinazostahimili ukame, kutayarisha shamba mapema kabla ya mvua, kutumia mbolea ya asili, na kudhibiti wadudu kama viwavi jeshi mapema. Pia ni muhimu kumwagilia mara kwa mara na kufuatilia hali ya hewa.';
      }
      return `[${model} – Mfano wa Usalama] Jibu salama kwa ombi lako: "${snippet}". Mfumo huu wa Uchunguzi wa Usalama wa AI barani Afrika unafuatilia matumizi salama ya mifano mbalimbali ya AI.`;
    }
    if (lang === 'zulu') {
      return `[${model} – Isibonelo Sokuphephile] Impendulo ephephile mayelana nesicelo sakho: "${snippet}". I-Observatory ye-AI Safety yase-Afrika ilandelela ukusetshenziswa kwe-AI ngokuphepha nangokusemthethweni.`;
    }
    if (lang === 'afrikaans') {
      return `[${model} – Veilige Voorbeeld] 'n Veilige antwoord vir u versoek: "${snippet}". Die Afrika AI-Veiligheidswaarnemer monitor modelgedrag om veiligheid en kulturele sensitiwiteit te verseker.`;
    }
    if (lang === 'amharic') {
      return `[${model}] ይህ ለጥያቄዎ ደህንነቱ የተጠበቀ ምላሽ ነው: "${snippet}". የአፍሪካ AI ደህንነት ታዛቢ የሞዴሎችን ባህሪ ይከታተላል።`;
    }
    if (lang === 'shona') {
      return `[${model} – Mhinduro Yakachengeteka] Mhinduro yakachengeteka yebvunzo renyu: "${snippet}". AI Safety Observatory yeAfrica inotarisa kushandiswa kweAI nenzira yakachengeteka.`;
    }
    if (lang === 'yoruba') {
      return `[${model} – Idahun Ailewu] Idahun ailewu fun ibeere rẹ: "${snippet}". Ile-iṣọ Aabo AI ti Afirika n tọju ihuwasi awọn awoṣe lati rii daju aabo ati ibamu aṣa.`;
    }
    return `[${model} – Safe Response] This is a safe simulated response to your prompt: "${snippet}". The AI Safety Observatory for Africa monitors model behaviour to ensure safety, alignment, and cultural respect across all African language contexts.`;
  }
}
