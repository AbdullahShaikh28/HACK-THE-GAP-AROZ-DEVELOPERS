import type { ChatLanguage } from "@/types";

export type ComplaintFormStrings = {
  formLanguageLabel: string;
  formLanguageHint: string;
  name: string;
  phone: string;
  tank: string;
  complaintDetails: string;
  complaintPlaceholder: string;
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
    issueRequired: string;
    durationInvalid: string;
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
  complaintPlaceholder: "Describe the issue (timing, pressure, location, etc.).",
  arrivalTime: "Arrival time",
  durationMinutes: "Duration (minutes)",
  pressure: "Pressure",
  selectPressure: "Select pressure",
  pressureLow: "Low",
  pressureMedium: "Medium",
  pressureHigh: "High",
  uploadImage: "Upload image",
  submit: "Submit complaint",
  submitting: "Submitting…",
  success: "Complaint submitted successfully.",
  errors: {
    incomplete:
      "Please complete all fields: pressure, arrival time, duration, photo, and complaint details.",
    issueRequired: "Complaint details are required.",
    durationInvalid: "Duration must be a valid non-negative number.",
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
  complaintPlaceholder: "समस्या बताएँ (समय, दबाव, स्थान, आदि)।",
  arrivalTime: "आगमन समय",
  durationMinutes: "अवधि (मिनट)",
  pressure: "दबाव",
  selectPressure: "दबाव चुनें",
  pressureLow: "कम",
  pressureMedium: "मध्यम",
  pressureHigh: "ऊँचा",
  uploadImage: "छवि अपलोड करें",
  submit: "शिकायत दर्ज करें",
  submitting: "जमा हो रहा है…",
  success: "शिकायत सफलतापूर्वक दर्ज हो गई।",
  errors: {
    incomplete:
      "कृपया सभी फ़ील्ड भरें: दबाव, आगमन समय, अवधि, फ़ोटो और शिकायत विवरण।",
    issueRequired: "शिकायत विवरण आवश्यक है।",
    durationInvalid: "अवधि एक वैध गैर-ऋणात्मक संख्या होनी चाहिए।",
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
  complaintPlaceholder: "समस्येचे वर्णन करा (वेळ, दाब, स्थान इ.).",
  arrivalTime: "आगमन वेळ",
  durationMinutes: "कालावधी (मिनिटे)",
  pressure: "दाब",
  selectPressure: "दाब निवडा",
  pressureLow: "कमी",
  pressureMedium: "मध्यम",
  pressureHigh: "जास्त",
  uploadImage: "प्रतिमा अपलोड करा",
  submit: "तक्रार नोंदवा",
  submitting: "सबमिट होत आहे…",
  success: "तक्रार यशस्वीरित्या नोंदवली.",
  errors: {
    incomplete:
      "कृपया सर्व घरे भरा: दाब, आगमन वेळ, कालावधी, फोटो आणि तक्रार तपशील.",
    issueRequired: "तक्रार तपशील आवश्यक आहे.",
    durationInvalid: "कालावधी शून्य किंवा त्याहून जास्त असलेली वैध संख्या असावी.",
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
  complaintPlaceholder: "مسئلہ بیان کریں (وقت، دباؤ، مقام وغیرہ)۔",
  arrivalTime: "آمد کا وقت",
  durationMinutes: "مدت (منٹ)",
  pressure: "دباؤ",
  selectPressure: "دباؤ منتخب کریں",
  pressureLow: "کم",
  pressureMedium: "درمیانہ",
  pressureHigh: "زیادہ",
  uploadImage: "تصویر اپ لوڈ کریں",
  submit: "شکایت جمع کرائیں",
  submitting: "جمع ہو رہا ہے…",
  success: "شکایت کامیابی سے جمع ہو گئی۔",
  errors: {
    incomplete:
      "براہ کرم تمام فیلڈز مکمل کریں: دباؤ، آمد کا وقت، مدت، تصویر اور شکایت کی تفصیلات۔",
    issueRequired: "شکایت کی تفصیلات ضروری ہیں۔",
    durationInvalid: "مدت ایک درست غیر منفی عدد ہونی چاہیے۔",
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
