/** Same rule as the API: 12-128 characters. */
export const ADMIN_PASSWORD_MIN = 12;
export const ADMIN_PASSWORD_MAX = 128;

export function passwordProblem(password: string): string | null {
  if (password.length < ADMIN_PASSWORD_MIN) return `Use at least ${ADMIN_PASSWORD_MIN} characters.`;
  if (password.length > ADMIN_PASSWORD_MAX) return `Use at most ${ADMIN_PASSWORD_MAX} characters.`;
  return null;
}

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** 16 random characters without look-alikes (0/O, 1/l/I), from the browser's crypto RNG. */
export function generateTemporaryPassword(random: (values: Uint32Array) => Uint32Array = (values) => crypto.getRandomValues(values)) {
  const values = random(new Uint32Array(16));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
