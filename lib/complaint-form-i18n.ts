import type { ChatLanguage } from "@/types";

export type ComplaintFormStrings = {
  formLanguageLabel: string;
  formLanguageHint: string;
  name: string;
  phone: string;
  tank: string;
  complaintDetails: string;
  complaintPlaceholder: string;
  uploadImage: string;
  submit: string;
  submitting: string;
  success: string;
  errors: {
    incomplete: string;
    issueRequired: string;
    submitFailed: string;
    imageUrl: string;
  };
};

const en: ComplaintFormStrings = {
  formLanguageLabel: "Form language",
  formLanguageHint:
    "Choose how this page should show labels. Your choice is saved with the complaint (same codes as chat: en, hi, mr, ur).",
  name: "Name",
  phone: "Phone number",
  tank: "Tank",
  complaintDetails: "Complaint details",
  complaintPlaceholder: "Describe the issue (what happened, where, when, etc.).",
  uploadImage: "Upload image",
  submit: "Submit complaint",
  submitting: "Submitting…",
  success: "Complaint submitted successfully.",
  errors: {
    incomplete: "Please add your complaint details, attach a photo, and fill name, phone, and tank.",
    issueRequired: "Complaint details are required.",
    submitFailed: "Failed to submit complaint.",
    imageUrl: "Could not get image URL after upload.",
  },
};

const hi: ComplaintFormStrings = {
  formLanguageLabel: "फ़ॉर्म की भाषा",
  formLanguageHint:
    "पृष्ठ पर लेबल किस भाषा में दिखें, चुनें। आपकी पसंद शिकायत के साथ सुरक्षित होती है (चैट जैसी भाषाएँ: en, hi, mr, ur)।",
  name: "नाम",
  phone: "फ़ोन नंबर",
  tank: "टैंक",
  complaintDetails: "शिकायत विवरण",
  complaintPlaceholder: "समस्या बताएँ (क्या हुआ, कहाँ, कब, आदि)।",
  uploadImage: "छवि अपलोड करें",
  submit: "शिकायत दर्ज करें",
  submitting: "जमा हो रहा है…",
  success: "शिकायत सफलतापूर्वक दर्ज हो गई।",
  errors: {
    incomplete:
      "कृपया शिकायत विवरण, फ़ोटो, नाम, फ़ोन और टैंक भरें।",
    issueRequired: "शिकायत विवरण आवश्यक है।",
    submitFailed: "शिकायत दर्ज नहीं हो सकी।",
    imageUrl: "अपलोड के बाद छवि URL प्राप्त नहीं हो सका।",
  },
};

const mr: ComplaintFormStrings = {
  formLanguageLabel: "फॉर्म भाषा",
  formLanguageHint:
    "पृष्ठावरील लेबले कोणत्या भाषेत दिसावीत ते निवडा. आपली निवड तक्रारीसोबत जतन होते (चॅटसारख्याच भाषा: en, hi, mr, ur).",
  name: "नाव",
  phone: "फोन नंबर",
  tank: "टाके",
  complaintDetails: "तक्रार तपशील",
  complaintPlaceholder: "समस्येचे वर्णन करा (काय झाले, कुठे, केव्हा इ.).",
  uploadImage: "प्रतिमा अपलोड करा",
  submit: "तक्रार नोंदवा",
  submitting: "सबमिट होत आहे…",
  success: "तक्रार यशस्वीरित्या नोंदवली.",
  errors: {
    incomplete: "कृपया तक्रार तपशील, फोटो, नाव, फोन आणि टाके भरा.",
    issueRequired: "तक्रार तपशील आवश्यक आहे.",
    submitFailed: "तक्रार नोंदवता आली नाही.",
    imageUrl: "अपलोडनंतर प्रतिमा URL मिळाला नाही.",
  },
};

const ur: ComplaintFormStrings = {
  formLanguageLabel: "فارم کی زبان",
  formLanguageHint:
    "منتخب کریں کہ صفحے پر لیبل کس زبان میں ہوں۔ آپ کی پسند شکایت کے ساتھ محفوظ ہوتی ہے (چیٹ جیسی زبانیں: en, hi, mr, ur)۔",
  name: "نام",
  phone: "فون نمبر",
  tank: "ٹینک",
  complaintDetails: "شکایت کی تفصیلات",
  complaintPlaceholder: "مسئلہ بیان کریں (کیا ہوا، کہاں، کب، وغیرہ)۔",
  uploadImage: "تصویر اپ لوڈ کریں",
  submit: "شکایت جمع کرائیں",
  submitting: "جمع ہو رہا ہے…",
  success: "شکایت کامیابی سے جمع ہو گئی۔",
  errors: {
    incomplete:
      "براہ کرم شکایت کی تفصیلات، تصویر، نام، فون اور ٹینک مکمل کریں۔",
    issueRequired: "شکایت کی تفصیلات ضروری ہیں۔",
    submitFailed: "شکایت جمع نہیں ہو سکی۔",
    imageUrl: "اپ لوڈ کے بعد تصویر کا URL نہ مل سکا۔",
  },
};

export const COMPLAINT_FORM_COPY: Record<ChatLanguage, ComplaintFormStrings> = {
  en,
  hi,
  mr,
  ur,
};

export function complaintFormT(lang: ChatLanguage): ComplaintFormStrings {
  return COMPLAINT_FORM_COPY[lang] ?? en;
}
