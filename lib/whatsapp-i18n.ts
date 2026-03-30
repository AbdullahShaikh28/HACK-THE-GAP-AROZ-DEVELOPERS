import { formatTankListLinesForLang } from "./whatsapp-tank-lines";

export type WhatsAppLang = "hi" | "mr" | "ur" | "en";

const LANG_BY_NUM: Record<number, WhatsAppLang> = {
  1: "hi",
  2: "mr",
  3: "ur",
  4: "en",
};

export function parseLanguageReply(body: string): WhatsAppLang | null {
  const t = body.trim();
  if (!/^[1-4]$/.test(t)) return null;
  return LANG_BY_NUM[Number(t)] ?? null;
}

export function isGreetingOrStart(body: string): boolean {
  const t = body.trim().toLowerCase();
  if (t.length === 0) return false;
  const greetings = [
    "hi",
    "hii",
    "hello",
    "hey",
    "start",
    "namaste",
    "namaskar",
    "help",
    "नमस्ते",
    "हाय",
    "हेलो",
  ];
  if (greetings.includes(t)) return true;
  if (t.length <= 3 && /^h+i+!*$/i.test(t)) return true;
  return false;
}

type Copy = {
  languageMenuTitle: string;
  languageMenuHint: string;
  languageInvalid: string;
  /** Use %N for max zone (1…N). One line: tank IDs above vs zone numbers below. */
  areaPrompt: string;
  areaExample: string;
  areaInvalid: string;
  complaintPrompt: string;
  /** Shown after the full tank reference list; then user replies with complaint text. */
  complaintAfterTanks: string;
  thankYou: string;
  tankListHeader: string;
  tankListContinued: string;
  noAreasFallback: string;
  /** Use %N for max zone; when user sends a number that matches a tank id but not a zone. */
  areaInvalidLooksLikeTankId: string;
};

const COPY: Record<WhatsAppLang, Copy> = {
  en: {
    languageMenuTitle: "Welcome! Please choose your language (reply with a number):",
    languageMenuHint:
      "1 — Hindi\n2 — Marathi\n3 — Urdu\n4 — English",
    languageInvalid:
      "Invalid choice. Reply with 1, 2, 3, or 4 to select your language.",
    areaPrompt:
      "The numbers in the tank list above are tank IDs (reference only). Reply with a number from 1 to %N for your zone from the list below:",
    areaExample: "Example: Reply with 2",
    areaInvalid: "Invalid selection. Please reply with a number from the list below.",
    complaintPrompt: "Now please type your complaint details.",
    complaintAfterTanks:
      "The list above is for reference only (tank IDs).\n\nPlease type your complaint details:",
    thankYou:
      "Thank you. Your complaint has been recorded.\nIf you want to add more details or an image, use this link:",
    tankListHeader: "All water tanks (reference):",
    tankListContinued: "All water tanks (continued):",
    noAreasFallback:
      "Please type your complaint details. (Area list is currently unavailable.)",
    areaInvalidLooksLikeTankId:
      "That number looks like a tank ID from the list above. Please reply with a zone number 1–%N from the list below only.",
  },
  hi: {
    languageMenuTitle: "स्वागत है! कृपया अपनी भाषा चुनें (नंबर भेजें):",
    languageMenuHint:
      "1 — हिंदी\n2 — मराठी\n3 — उर्दू\n4 — अंग्रेज़ी",
    languageInvalid:
      "गलत विकल्प। भाषा चुनने के लिए 1, 2, 3 या 4 भेजें।",
    areaPrompt:
      "ऊपर टंकी सूची के नंबर टंकी ID हैं। अपना क्षेत्र नीचे की सूची से केवल 1 से %N तक के नंबर में से चुनें:",
    areaExample: "उदाहरण: 2 भेजें",
    areaInvalid: "गलत चयन। सूची में से सही नंबर भेजें।",
    complaintPrompt: "अब कृपया अपनी शिकायत विवरण में लिखें।",
    complaintAfterTanks:
      "ऊपर की सूची केवल संदर्भ (टंकी ID) के लिए है।\n\nअब अपनी शिकायत विवरण में लिखें:",
    thankYou:
      "धन्यवाद। आपकी शिकायत दर्ज कर ली गई है।\nअधिक विवरण या फोटो के लिए यह लिंक खोलें:",
    tankListHeader: "सभी जल टंकियाँ (संदर्भ):",
    tankListContinued: "सभी जल टंकियाँ (जारी):",
    noAreasFallback:
      "कृपया अपनी शिकायत लिखें। (क्षेत्र सूची अभी उपलब्ध नहीं है।)",
    areaInvalidLooksLikeTankId:
      "यह नंबर ऊपर वाली टंकी ID जैसा लगता है। कृपया नीचे की क्षेत्र सूची से केवल 1–%N में से एक नंबर भेजें।",
  },
  mr: {
    languageMenuTitle: "स्वागत आहे! कृपया भाषा निवडा (क्रमांक पाठवा):",
    languageMenuHint:
      "1 — हिंदी\n2 — मराठी\n3 — उर्दू\n4 — इंग्रजी",
    languageInvalid:
      "चुकीची निवड. भाषा साठी 1, 2, 3 किंवा 4 पाठवा.",
    areaPrompt:
      "वरील टाकी यादीतील नंबर टाकीचे ID आहेत. तुमचा परिसर खालील यादीतून फक्त 1 ते %N पैकी एक नंबर पाठवा:",
    areaExample: "उदाहरण: 2 पाठवा",
    areaInvalid: "चुकीची निवड. यादीतील योग्य क्रमांक पाठवा.",
    complaintPrompt: "आता तुमच्या तक्रारीचे तपशील टाइप करा.",
    complaintAfterTanks:
      "वरील यादी फक्त संदर्भासाठी आहे (टाकी ID).\n\nआता तुमच्या तक्रारीचे तपशील टाइप करा:",
    thankYou:
      "धन्यवाद. तुमची तक्रार नोंदवली गेली.\nअधिक माहिती किंवा फोटोसाठी हा दुवा वापरा:",
    tankListHeader: "सर्व पाण्याचे टाके (संदर्भ):",
    tankListContinued: "सर्व पाण्याचे टाके (सुरू):",
    noAreasFallback:
      "कृपया तुमच्या तक्रारीचे तपशील टाइप करा. (क्षेत्र यादी सध्या उपलब्ध नाही.)",
    areaInvalidLooksLikeTankId:
      "तुम्ही टाकी ID सारखा नंबर पाठवला दिसतो. कृपया खालील क्षेत्र यादीतून 1 ते %N पैकी एक नंबर पाठवा.",
  },
  ur: {
    languageMenuTitle: "خوش آمدید! زبان منتخب کریں (نمبر بھیجیں):",
    languageMenuHint:
      "1 — ہندی\n2 — مراٹھی\n3 — اردو\n4 — انگریزی",
    languageInvalid:
      "غلط انتخاب۔ زبان کے لیے 1، 2، 3 یا 4 بھیجیں۔",
    areaPrompt:
      "اوپر ٹینک فہرست کے نمبر ٹینک ID ہیں۔ نیچے والی فہرست سے اپنے زون کے لیے 1 سے %N تک کا ایک نمبر بھیجیں:",
    areaExample: "مثال: 2 بھیجیں",
    areaInvalid: "غلط انتخاب۔ فہرست سے درست نمبر بھیجیں۔",
    complaintPrompt: "اب اپنی شکایت کی تفصیل لکھیں۔",
    complaintAfterTanks:
      "اوپر کی فہرست صرف حوالے کے لیے ہے (ٹینک ID)۔\n\nاب اپنی شکایت کی تفصیل لکھیں:",
    thankYou:
      "شکریہ۔ آپ کی شکایت درج کر لی گئی۔\nمزید تفصیل یا تصویر کے لیے یہ لنک کھولیں:",
    tankListHeader: "تمام پانی کے ٹینک (حوالہ):",
    tankListContinued: "تمام پانی کے ٹینک (جاری):",
    noAreasFallback:
      "براہ کرم اپنی شکایت لکھیں۔ (علاقے کی فہرست فی الوقت دستیاب نہیں۔)",
    areaInvalidLooksLikeTankId:
      "یہ نمبر اوپر والی ٹینک ID جیسا لگتا ہے۔ براہ کرم نیچے کی زون فہرست سے صرف 1–%N میں سے ایک نمبر بھیجیں۔",
  },
};

export function t(lang: WhatsAppLang): Copy {
  return COPY[lang] ?? COPY.en;
}

export function formatTankListLines(
  tanks: Array<{ id: number; name: string; ward: string | null }>,
  lang: WhatsAppLang = "en",
): string {
  return formatTankListLinesForLang(tanks, lang);
}

/** WhatsApp safe chunk size for long lists (leave room for headers). */
const MAX_BODY = 3500;

/** Split long tank lists into WhatsApp-sized messages; later chunks use `continuationHeader`. */
export function chunkTankMessages(
  header: string,
  continuationHeader: string,
  lines: string,
): string[] {
  const full = `${header}\n\n${lines}`;
  if (full.length <= MAX_BODY) return [full];
  const parts: string[] = [];
  const lineArr = lines.split("\n");
  let buf = `${header}\n\n`;
  for (const line of lineArr) {
    const sep = buf.endsWith("\n\n") ? "" : "\n";
    const candidate = buf + sep + line;
    if (candidate.length > MAX_BODY && buf.trim()) {
      parts.push(buf.trimEnd());
      buf = `${continuationHeader}\n\n${line}`;
    } else {
      buf = candidate;
    }
  }
  if (buf.trim()) parts.push(buf.trimEnd());
  return parts;
}

/** Append text to the last chunk if it fits under MAX_BODY; otherwise add a new message. */
export function appendSuffixToLastChunk(chunks: string[], suffix: string): string[] {
  const s = suffix.trim();
  if (!s) return chunks;
  if (chunks.length === 0) return [s];
  const next = [...chunks];
  const i = next.length - 1;
  const merged = `${next[i]}\n\n${s}`;
  if (merged.length <= MAX_BODY) {
    next[i] = merged;
    return next;
  }
  next.push(s);
  return next;
}
