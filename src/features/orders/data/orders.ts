import type { StoreOrder } from "../types/order";
const names = ["Aisha Khan", "Rohan Mehta", "Kavya Nair", "Priya Sharma", "Arjun Pillai", "Meena Joshi", "Rahul Shah", "Sunita Gupta", "Deepak Verma", "Vikram Reddy"];
const ids = ["cust-aisha-khan", "cust-rohan-mehta", "cust-kavya-nair", "cust-priya-sharma", "cust-arjun-pillai", "cust-meena-joshi", "cust-rahul-shah", "cust-sunita-gupta", "cust-deepak-verma", "cust-vikram-reddy"];
const fulfillment: StoreOrder["fulfillmentStatus"][] = ["pending", "processing", "shipped", "delivered", "cancelled"];
export const orderSeed: StoreOrder[] = names.map((customerName, index) => {
  const status = fulfillment[index % fulfillment.length];
  const total = 49900 * (index % 2 + 1) + 9900;
  return { id: `ORD-001${24 - index}`, customerId: ids[index], customerName, items: [{ productId: "rudraksha-mala", productNameSnapshot: "Rudraksha Mala", unitPriceInPaise: 49900, quantity: index % 2 + 1 }], subtotalInPaise: total - 9900, shippingInPaise: 9900, totalInPaise: total, paymentStatus: status === "cancelled" ? "refunded" : index % 4 === 0 ? "pending" : "paid", fulfillmentStatus: status, shippingAddress: "India", createdAt: `2026-09-${String(28 - index).padStart(2, "0")}T10:00:00Z`, updatedAt: `2026-09-${String(28 - index).padStart(2, "0")}T10:00:00Z`, events: [{ label: "Order placed", createdAt: `2026-09-${String(28 - index).padStart(2, "0")}T10:00:00Z` }] };
});
