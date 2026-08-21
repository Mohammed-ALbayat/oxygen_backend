const SYRIAN_MOBILE_PATTERN = /^09\d{8}$/;

/**
 * Converts a local Syrian mobile (09XXXXXXXX) to a Green API chatId.
 * Returns null when the phone is missing or invalid.
 */
export function toWhatsappChatId(
  phone: string | null | undefined,
  countryCode = '963',
): string | null {
  if (!phone || !SYRIAN_MOBILE_PATTERN.test(phone)) {
    return null;
  }

  return `${countryCode}${phone.slice(1)}@c.us`;
}
