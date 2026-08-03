export const PAYMENT_METHODS = [
  { value: "VISA", label: "Visa", shortLabel: "Visa" },
  { value: "MASTERCARD", label: "Mastercard", shortLabel: "Mastercard" },
  { value: "WEBPAY", label: "Webpay", shortLabel: "Webpay" },
  {
    value: "TRANSFERENCIA",
    label: "Transferencia bancaria",
    shortLabel: "Transferencia",
  },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map((m) => m.value);

export function getPaymentMethodLabel(
  value: string | null | undefined
): string {
  if (!value) return "No especificado";
  return (
    PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value
  );
}
