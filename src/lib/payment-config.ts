// Central switch for payment method. Flip this to "PAYSTACK" later and
// implement the paystack branch in checkout — order/schema code doesn't change.
export const ACTIVE_PAYMENT_METHOD: "MANUAL_TRANSFER" | "PAYSTACK" =
  "MANUAL_TRANSFER";

export const BANK_DETAILS = {
  bankName: "Your Bank Name",
  accountNumber: "0000000000",
  accountName: "Your Business Name",
};

// Every order gets a short reference the customer must use as the transfer
// narration/description. Makes manual reconciliation possible.
export function generateOrderReference(): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CS-${rand}`;
}
