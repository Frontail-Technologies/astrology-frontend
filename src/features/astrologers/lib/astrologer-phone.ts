/**
 * Sign-in phone numbers. The API requires E.164 (`+919876543210`); admins usually type Indian mobiles as ten
 * digits, so those get `+91`. Separators are ignored, matching the server.
 */
export const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizeLoginPhone(input: string): string {
  const compact = input.trim().replace(/[\s()-]/g, "");
  if (/^[6-9]\d{9}$/.test(compact)) return `+91${compact}`;
  if (/^0[6-9]\d{9}$/.test(compact)) return `+91${compact.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(compact)) return `+${compact}`;
  return compact;
}

export const isLoginPhone = (input: string) => E164_PATTERN.test(normalizeLoginPhone(input));

/** "+91 98765 43210" for Indian mobiles; other numbers are shown as stored. */
export function formatLoginPhone(phone: string): string {
  const match = /^\+91([6-9]\d{4})(\d{5})$/.exec(phone);
  return match ? `+91 ${match[1]} ${match[2]}` : phone;
}
