import { toWhatsappChatId } from './to-whatsapp-chat-id';

describe('toWhatsappChatId', () => {
  it('converts Syrian mobile to Green API chatId', () => {
    expect(toWhatsappChatId('0912345678')).toBe('963912345678@c.us');
  });

  it('uses custom country code when provided', () => {
    expect(toWhatsappChatId('0912345678', '963')).toBe('963912345678@c.us');
  });

  it('returns null for invalid phone numbers', () => {
    expect(toWhatsappChatId('1234567890')).toBeNull();
    expect(toWhatsappChatId('091234567')).toBeNull();
    expect(toWhatsappChatId('')).toBeNull();
    expect(toWhatsappChatId(undefined)).toBeNull();
  });
});
