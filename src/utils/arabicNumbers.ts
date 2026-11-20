export const formatArabicNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => new Intl.NumberFormat('ar-EG', options).format(value);

export const toArabicDigits = (value: string | number | null | undefined): string =>
  String(value ?? '').replace(/[0-9]/g, (digit) => String.fromCharCode(0x0660 + Number(digit)));

export const toWesternDigits = (value: string): string =>
  value.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
