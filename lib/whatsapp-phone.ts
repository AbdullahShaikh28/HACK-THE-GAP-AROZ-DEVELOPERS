/** Normalize digits and leading + for Twilio / WhatsApp addresses. */
export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

/** Twilio `to` value for WhatsApp outbound (e.g. whatsapp:+91...). */
export function toWhatsappAddress(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return "";
  return normalized.startsWith("whatsapp:") ? normalized : `whatsapp:${normalized}`;
}
