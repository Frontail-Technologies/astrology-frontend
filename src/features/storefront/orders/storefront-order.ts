export type StorefrontOrderStatus = "pending";
export type StorefrontPaymentStatus = "pending";
export type StorefrontPaymentMethod = "pending_integration";

export type StorefrontOrderAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type StorefrontOrderItem = {
  productId: string;
  productNameSnapshot: string;
  imageSrc?: string;
  unitPriceInPaise: number;
  quantity: number;
  lineTotalInPaise: number;
};

export type StorefrontMockOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: StorefrontOrderStatus;
  paymentStatus: StorefrontPaymentStatus;
  paymentMethod: StorefrontPaymentMethod;
  contact: { fullName: string; email: string; phone: string };
  shippingAddress: StorefrontOrderAddress;
  deliveryMethod: "standard";
  items: StorefrontOrderItem[];
  subtotalInPaise: number;
  discountInPaise: number;
  shippingPaise: null;
  totalInPaise: number;
};
