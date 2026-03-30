import type { ChatLanguage } from "@/types";

/** Same set as chat / WhatsApp: en, hi, mr, ur. */
export const FORM_LANGUAGE_OPTIONS: Array<{
  code: ChatLanguage;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}> = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", dir: "ltr" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", dir: "rtl" },
];
