import { z } from "zod";

import type { ProvisionAstrologerInput } from "../types/astrologer-admin.ts";
import { isLoginPhone, normalizeLoginPhone } from "./astrologer-phone.ts";

export type ProvisionAstrologerFormValues = { phone: string; displayName: string; country: string; email: string };

export const emptyProvisionAstrologerForm: ProvisionAstrologerFormValues = { phone: "", displayName: "", country: "India", email: "" };

export const provisionAstrologerFormSchema = z.object({
  phone: z.string().refine(isLoginPhone, { error: "Enter a mobile number, for example 98765 43210 or +91 98765 43210." }),
  displayName: z.string().trim().min(2, { error: "Enter the name customers will see (at least 2 characters)." }).max(160),
  country: z.string().trim().min(2, { error: "Choose a country." }).max(120),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email({ error: "Enter a valid email or leave it empty." }).max(320)]),
});

export function provisionAstrologerFormToInput(values: ProvisionAstrologerFormValues): ProvisionAstrologerInput {
  const email = values.email.trim().toLowerCase();
  return {
    phone: normalizeLoginPhone(values.phone),
    displayName: values.displayName.trim(),
    country: values.country.trim(),
    ...(email ? { email } : {}),
  };
}
