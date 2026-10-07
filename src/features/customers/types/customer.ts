/**
 * Future backend-owned customer contract. No customer store exists yet, so no
 * records are seeded in the frontend.
 */
export type CustomerBirthDetails = {
  date?: string;
  time?: string;
  place?: string;
};

export type CustomerAccountStatus = "active" | "suspended" | "archived";

export type Customer = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  birthDetails?: CustomerBirthDetails;
  accountStatus?: CustomerAccountStatus;
  createdAt?: string;
  updatedAt?: string;
};
