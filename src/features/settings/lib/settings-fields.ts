/**
 * Admin form specs for the backend's allow-listed settings registry. Pure (unit-tested with `node --test`).
 * The server validates every value against its own schema; these specs only shape inputs and convert units.
 * Keys the backend adds later without a spec here render read-only rather than as a guessed editor.
 */
import { paiseToRupeesInput, rupeesToPaise } from "../../admin/lib/money.ts";

export type SettingFieldKind = "text" | "email" | "integer" | "rupees" | "percentFromBps" | "readonly";
/** `options` turns the input into a select of input-text values → labels (the stored value may still be outside the list). */
export type SettingFieldSpec = { label: string; kind: SettingFieldKind; nullable?: boolean; suffix?: string; min?: number; max?: number; options?: Readonly<Record<string, string>> };

const pageSizeOptions = { "10": "10 per page", "12": "12 per page", "20": "20 per page", "24": "24 per page", "50": "50 per page", "100": "100 per page" } as const;

export const settingFieldSpecs: Record<string, SettingFieldSpec> = {
  "general.siteName": { label: "Site name", kind: "text", max: 120 },
  "general.supportEmail": { label: "Public support email", kind: "email", nullable: true },
  "store.standardShippingPaise": { label: "Standard shipping", kind: "rupees" },
  "store.freeShippingThresholdPaise": { label: "Free shipping from (subtotal)", kind: "rupees", nullable: true },
  "store.currency": { label: "Currency", kind: "readonly" },
  "store.lowStockThreshold": { label: "Low-stock alert at", kind: "integer", suffix: "units or fewer", min: 0, max: 100_000 },
  "consultations.defaultDurationMinutes": { label: "Default consultation duration", kind: "integer", suffix: "minutes", min: 5, max: 480 },
  "consultations.chatMinimumStartMinutes": { label: "Minimum chat balance to start", kind: "integer", suffix: "minutes", min: 1, max: 60 },
  "consultations.platformCommissionBps": { label: "Platform commission", kind: "percentFromBps", suffix: "%", min: 0, max: 100 },
  "poojas.defaultLeadTimeHours": { label: "Default pooja lead time", kind: "integer", suffix: "hours", min: 0, max: 8760 },
  "support.supportEmail": { label: "Support ticket email", kind: "email", nullable: true },
  "content.defaultPageSize": { label: "Default content page size", kind: "integer", min: 1, max: 100, options: pageSizeOptions },
};

export const settingGroupLabels: Record<string, string> = {
  general: "General",
  store: "Store",
  consultations: "Consultations",
  poojas: "Poojas",
  support: "Support",
  content: "Content",
};

/** "store.lowStockThreshold" → "Low stock threshold", for keys the admin UI does not know yet. */
function humanizeSettingKey(key: string) {
  const words = (key.split(".").pop() ?? key).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function specFor(key: string): SettingFieldSpec {
  return settingFieldSpecs[key] ?? { label: humanizeSettingKey(key), kind: "readonly" };
}

/** Server value → editable input text. */
export function toInput(spec: SettingFieldSpec, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (spec.kind === "rupees") return paiseToRupeesInput(Number(value));
  if (spec.kind === "percentFromBps") return String(Number(value) / 100);
  return String(value);
}

/** Input text → API value, or an error message. Empty input means null for nullable fields. */
export function fromInput(spec: SettingFieldSpec, text: string): { value: unknown } | { error: string } {
  const trimmed = text.trim();
  if (!trimmed) return spec.nullable ? { value: null } : { error: "A value is required." };
  switch (spec.kind) {
    case "text":
    case "email":
      return { value: trimmed };
    case "integer": {
      if (!/^\d+$/.test(trimmed)) return { error: "Enter a whole number." };
      return { value: Number(trimmed) };
    }
    case "rupees": {
      const paise = rupeesToPaise(trimmed);
      return paise === null ? { error: "Enter an amount in rupees (up to 2 decimals)." } : { value: paise };
    }
    case "percentFromBps": {
      if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return { error: "Enter a percentage with up to 2 decimals." };
      return { value: Math.round(Number(trimmed) * 100) };
    }
    default:
      return { error: "This setting is read-only." };
  }
}

/** Select options for a spec, keeping the current input value selectable when it is not one of the presets. */
export function settingOptions(spec: SettingFieldSpec, current: string): Record<string, string> | null {
  if (!spec.options) return null;
  const value = current.trim();
  if (!value || value in spec.options) return { ...spec.options };
  return { [value]: `${value}${spec.suffix ? ` ${spec.suffix}` : ""} (current)`, ...spec.options };
}
