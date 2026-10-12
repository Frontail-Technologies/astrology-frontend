import { z } from "zod";

export const indiaStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
] as const;

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().regex(/^[0-9+()\-\s]{8,18}$/, "Enter a valid phone number."),
  addressLine1: z.string().trim().min(5, "Enter your delivery address."),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city."),
  state: z.string().trim().min(2, "Select your state."),
  postalCode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code."),
  country: z.literal("India"),
  deliveryMethod: z.literal("standard"),
  paymentMethod: z.literal("pending_integration"),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
