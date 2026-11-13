export const PAYMOB_FEE_RATE = 0.025;
export const PAYMOB_FIXED_FEE = 3;

export function calculatePaymobFee(amount: number): number {
  return Math.round((amount * PAYMOB_FEE_RATE + PAYMOB_FIXED_FEE) * 100) / 100;
}
