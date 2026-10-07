export type AdminSettings = {
  general: { platformName: string; supportEmail: string; supportPhone: string; timezone: string; currency: "INR" };
  consultations: { chatEnabled: boolean; voiceEnabled: boolean; videoEnabled: boolean; defaultDuration: string; bookingNoticeHours: string; cancellationHours: string; allowRescheduling: boolean; maxReschedules: string };
  store: { enabled: boolean; currency: "INR"; trackInventory: boolean; lowStockThreshold: string; allowOutOfStockPurchase: boolean };
  payments: { provider: "razorpay" | "none"; upiEnabled: boolean; cardsEnabled: boolean; netBankingEnabled: boolean; autoRefundOnCancellation: boolean };
  notifications: { emailEnabled: boolean; smsEnabled: boolean; whatsappEnabled: boolean; pushEnabled: boolean; bookingConfirmation: boolean; paymentSuccess: boolean; orderUpdates: boolean };
  integrations: Record<"razorpay" | "whatsapp" | "sms" | "email" | "maps" | "astrologyEngine" | "storage", "connected" | "disconnected" | "needs-setup">;
};
export type SettingsSection = keyof AdminSettings;
