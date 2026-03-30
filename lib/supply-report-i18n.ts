import type { ChatLanguage } from "@/types";

export type SupplyReportStrings = {
  formLanguageLabel: string;
  formLanguageHint: string;
  name: string;
  phone: string;
  tank: string;
  reportDetails: string;
  detailsPlaceholder: string;
  arrivalDate: string;
  arrivalTime: string;
  durationMinutes: string;
  pressure: string;
  selectPressure: string;
  pressureLow: string;
  pressureMedium: string;
  pressureHigh: string;
  uploadImage: string;
  submit: string;
  submitting: string;
  success: string;
  errors: {
    incomplete: string;
    detailsRequired: string;
    durationInvalid: string;
    submitFailed: string;
    imageUrl: string;
  };
};

const en: SupplyReportStrings = {
  formLanguageLabel: "Form language",
  formLanguageHint:
    "Choose how this page should show labels. Your choice is saved with the report (same codes as chat: en, hi, mr, ur).",
  name: "Name",
  phone: "Phone number",
  tank: "Tank",
  reportDetails: "Report details",
  detailsPlaceholder: "What did you observe about the supply?",
  arrivalDate: "Arrival date",
  arrivalTime: "Arrival time",
  durationMinutes: "Duration (minutes)",
  pressure: "Pressure",
  selectPressure: "Select pressure",
  pressureLow: "Low",
  pressureMedium: "Medium",
  pressureHigh: "High",
  uploadImage: "Upload image",
  submit: "Submit supply report",
  submitting: "Submitting…",
  success: "Supply report submitted successfully.",
  errors: {
    incomplete:
      "Please complete all fields: pressure, date, time, duration, photo, and report details.",
    detailsRequired: "Report details are required.",
    durationInvalid: "Duration must be a valid non-negative number.",
    submitFailed: "Failed to submit supply report.",
    imageUrl: "Could not get image URL after upload.",
  },
};

const hi: SupplyReportStrings = {
  formLanguageLabel: "फ़ॉर्म की भाषा",
  formLanguageHint:
    "पृष्ठ पर लेबल किस भाषा में दिखें, चुनें। आपकी पसंद रिपोर्ट के साथ सुरक्षित होती है (चैट जैसी भाषाएँ: en, hi, mr, ur)।",
  name: "नाम",
  phone: "फ़ोन नंबर",
  tank: "टैंक",
  reportDetails: "रिपोर्ट विवरण",
  detailsPlaceholder: "आपने आपूर्ति के बारे में क्या देखा?",
  arrivalDate: "आगमन तिथि",
  arrivalTime: "आगमन समय",
  durationMinutes: "अवधि (मिनट)",
  pressure: "दबाव",
  selectPressure: "दबाव चुनें",
  pressureLow: "कम",
  pressureMedium: "मध्यम",
  pressureHigh: "ऊँचा",
  uploadImage: "छवि अपलोड करें",
  submit: "सप्लाई रिपोर्ट जमा करें",
  submitting: "जमा हो रहा है…",
  success: "सप्लाई रिपोर्ट सफलतापूर्वक जमा हो गई।",
  errors: {
    incomplete:
      "कृपया सभी फ़ील्ड भरें: दबाव, तिथि, समय, अवधि, फ़ोटो और रिपोर्ट विवरण।",
    detailsRequired: "रिपोर्ट विवरण आवश्यक है।",
    durationInvalid: "अवधि एक वैध गैर-ऋणात्मक संख्या होनी चाहिए।",
    submitFailed: "सप्लाई रिपोर्ट जमा नहीं हो सकी।",
    imageUrl: "अपलोड के बाद छवि URL प्राप्त नहीं हो सका।",
  },
};

const mr: SupplyReportStrings = {
  formLanguageLabel: "फॉर्म भाषा",
  formLanguageHint:
    "पृष्ठावरील लेबले कोणत्या भाषेत दिसावीत ते निवडा. आपली निवड अहवालासोबत जतन होते (चॅटसारख्याच भाषा: en, hi, mr, ur).",
  name: "नाव",
  phone: "फोन नंबर",
  tank: "टाके",
  reportDetails: "अहवाल तपशील",
  detailsPlaceholder: "पुरवठ्याबद्दल तुम्ही काय निरीक्षण केले?",
  arrivalDate: "आगमन तारीख",
  arrivalTime: "आगमन वेळ",
  durationMinutes: "कालावधी (मिनिटे)",
  pressure: "दाब",
  selectPressure: "दाब निवडा",
  pressureLow: "कमी",
  pressureMedium: "मध्यम",
  pressureHigh: "जास्त",
  uploadImage: "प्रतिमा अपलोड करा",
  submit: "पुरवठा अहवाल सबमिट करा",
  submitting: "सबमिट होत आहे…",
  success: "पुरवठा अहवाल यशस्वीरित्या सबमिट झाला.",
  errors: {
    incomplete:
      "कृपया सर्व घरे भरा: दाब, तारीख, वेळ, कालावधी, फोटो आणि अहवाल तपशील.",
    detailsRequired: "अहवाल तपशील आवश्यक आहे.",
    durationInvalid: "कालावधी शून्य किंवा त्याहून जास्त असलेली वैध संख्या असावी.",
    submitFailed: "पुरवठा अहवाल सबमिट होऊ शकला नाही.",
    imageUrl: "अपलोडनंतर प्रतिमा URL मिळाला नाही.",
  },
};

const ur: SupplyReportStrings = {
  formLanguageLabel: "فارم کی زبان",
  formLanguageHint:
    "منتخب کریں کہ صفحے پر لیبل کس زبان میں ہوں۔ آپ کی پسند رپورٹ کے ساتھ محفوظ ہوتی ہے (چیٹ جیسی زبانیں: en, hi, mr, ur)۔",
  name: "نام",
  phone: "فون نمبر",
  tank: "ٹینک",
  reportDetails: "رپورٹ کی تفصیلات",
  detailsPlaceholder: "آپ نے سپلائی کے بارے میں کیا مشاہدہ کیا؟",
  arrivalDate: "آمد کی تاریخ",
  arrivalTime: "آمد کا وقت",
  durationMinutes: "مدت (منٹ)",
  pressure: "دباؤ",
  selectPressure: "دباؤ منتخب کریں",
  pressureLow: "کم",
  pressureMedium: "درمیانہ",
  pressureHigh: "زیادہ",
  uploadImage: "تصویر اپ لوڈ کریں",
  submit: "سپلائی رپورٹ جمع کرائیں",
  submitting: "جمع ہو رہا ہے…",
  success: "سپلائی رپورٹ کامیابی سے جمع ہو گئی۔",
  errors: {
    incomplete:
      "براہ کرم تمام فیلڈز مکمل کریں: دباؤ، تاریخ، وقت، مدت، تصویر اور رپورٹ کی تفصیلات۔",
    detailsRequired: "رپورٹ کی تفصیلات ضروری ہیں۔",
    durationInvalid: "مدت ایک درست غیر منفی عدد ہونی چاہیے۔",
    submitFailed: "سپلائی رپورٹ جمع نہیں ہو سکی۔",
    imageUrl: "اپ لوڈ کے بعد تصویر کا URL نہ مل سکا۔",
  },
};

export const SUPPLY_REPORT_COPY: Record<ChatLanguage, SupplyReportStrings> = {
  en,
  hi,
  mr,
  ur,
};

export function supplyReportT(lang: ChatLanguage): SupplyReportStrings {
  return SUPPLY_REPORT_COPY[lang] ?? en;
}
