/**
 * Rupee ↔ paise conversion for Admin money inputs. Pure, so it is unit-tested with `node --test`.
 * Admins type rupees (up to 2 decimals); the API only ever receives integer paise.
 */
export function rupeesToPaise(input: string): number | null {
  const text = input.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(paise) ? paise : null;
}

export function paiseToRupeesInput(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return "";
  const whole = Math.trunc(paise / 100);
  const fraction = Math.abs(paise % 100);
  return fraction === 0 ? String(whole) : `${whole}.${String(fraction).padStart(2, "0")}`;
}
