import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  NOTIFICATION_TEMPLATE_LIMITS,
  isNotificationEventFilter,
  notificationEventFilterOptions,
  notificationEventLabel,
  notificationTemplateEventLabels,
} from "./notification-template-status.ts";

describe("notification template events", () => {
  it("canonical keys fit the event field limits and filter rule", () => {
    for (const key of Object.keys(notificationTemplateEventLabels)) {
      assert.ok(key.length >= NOTIFICATION_TEMPLATE_LIMITS.event[0], key);
      assert.equal(isNotificationEventFilter(key), true, key);
    }
  });

  it("labels canonical keys and shows custom keys as written", () => {
    assert.equal(notificationEventLabel("payment_succeeded"), "Payment succeeded");
    assert.equal(notificationEventLabel("order.shipped"), "order.shipped");
  });

  it("keeps a custom URL value visible in the filter options", () => {
    assert.deepEqual(notificationEventFilterOptions(undefined), notificationTemplateEventLabels);
    assert.deepEqual(notificationEventFilterOptions("payout_update"), notificationTemplateEventLabels);
    assert.equal(notificationEventFilterOptions("order.shipped")["order.shipped"], "order.shipped");
  });
});
