/** Public HTTPS image attached to outbound WhatsApp messages (Twilio `mediaUrl`). */
export const DEFAULT_WHATSAPP_OUTBOUND_IMAGE =
  "https://epblkisrjrsszdgkoibg.supabase.co/storage/v1/object/public/imaged/ASCDCE.jpeg";

export function getWhatsappOutboundMediaUrls(): string[] {
  const url =
    process.env.WHATSAPP_OUTBOUND_IMAGE_URL?.trim() || DEFAULT_WHATSAPP_OUTBOUND_IMAGE;
  return url ? [url] : [];
}
