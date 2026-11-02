import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAdminListState } from "../../admin/data/admin-list-state.ts";
import { notificationSubjectRequired } from "../constants/notification-template-status.ts";
import { notificationTemplateListConfig } from "../state/notification-template-list-state.ts";
import { emptyNotificationTemplateForm, notificationTemplateFormSchema, notificationTemplateFormToInput } from "./notification-template-form.ts";

describe("notification template form", () => {
  const base = { ...emptyNotificationTemplateForm, name: "Booking confirmed", event: "consultation.booked", content: "Hi {{customer_name}}" };

  it("requires a subject only for active email and push templates", () => {
    assert.equal(notificationSubjectRequired("email", "active"), true);
    assert.equal(notificationSubjectRequired("push", "active"), true);
    assert.equal(notificationSubjectRequired("email", "draft"), false);
    assert.equal(notificationSubjectRequired("sms", "active"), false);
    const missing = notificationTemplateFormSchema.safeParse({ ...base, status: "active" });
    assert.deepEqual(missing.error?.issues.map((issue) => issue.path.join(".")), ["subject"]);
    assert.equal(notificationTemplateFormSchema.safeParse({ ...base, status: "active", subject: "Confirmed" }).success, true);
    assert.equal(notificationTemplateFormSchema.safeParse({ ...base, channel: "whatsapp", status: "active" }).success, true);
  });

  it("maps to the API body, dropping the subject for SMS and WhatsApp", () => {
    assert.deepEqual(notificationTemplateFormToInput({ ...base, subject: "  Confirmed ", name: " Booking confirmed " }), {
      name: "Booking confirmed",
      channel: "email",
      event: "consultation.booked",
      subject: "Confirmed",
      content: "Hi {{customer_name}}",
      status: "draft",
    });
    assert.equal(notificationTemplateFormToInput({ ...base, channel: "sms", subject: "Stale" }).subject, null);
    assert.equal(notificationTemplateFormToInput({ ...base, subject: "  " }).subject, null);
  });

  it("list state accepts an exact event key", () => {
    const state = parseAdminListState(new URLSearchParams("event=order.shipped&channel=push&status=gone"), notificationTemplateListConfig);
    assert.deepEqual(state.filters, { event: "order.shipped", channel: "push" });
  });
});
