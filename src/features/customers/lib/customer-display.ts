/**
 * Display helpers for people records whose name is optional (customers register with an email or phone first).
 * The primary label falls back name → email → phone → a neutral noun, so a list never shows "—" as a name, and
 * initials are derived from whatever the primary label is (never "?").
 */
export type PersonLike = { name?: string | null; email?: string | null; phone?: string | null };

const clean = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** Primary label: name, else email, else phone, else `fallback`. */
export function personPrimaryLabel(person: PersonLike, fallback = "Customer") {
  return clean(person.name) ?? clean(person.email) ?? clean(person.phone) ?? fallback;
}

/**
 * Secondary line under the primary label: the email when the name is primary, otherwise the phone (when it is not
 * already the primary label). `null` when nothing else is worth showing.
 */
export function personSecondaryLabel(person: PersonLike) {
  const name = clean(person.name);
  const email = clean(person.email);
  const phone = clean(person.phone);
  if (name) return email ?? phone;
  if (email) return phone;
  return null;
}

/**
 * Two-letter initials from the name, else from the email's local part (split on . _ - +), else from the phone's
 * last digits. Always returns something readable.
 */
export function personInitials(person: PersonLike, fallback = "CU") {
  const name = clean(person.name);
  if (name) return initialsFromWords(name.split(/\s+/)) ?? fallback;
  const email = clean(person.email);
  if (email) return initialsFromWords(email.split("@")[0].split(/[._\-+]+/)) ?? fallback;
  const phone = clean(person.phone);
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 2) return digits.slice(-2);
  }
  return fallback;
}

function initialsFromWords(words: string[]) {
  const parts = words.map((word) => word.replace(/[^\p{L}\p{N}]/gu, "")).filter(Boolean);
  if (parts.length === 0) return null;
  const value = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
  return value.toUpperCase();
}
