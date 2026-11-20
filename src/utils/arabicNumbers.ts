const EASTERN_ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

export const toWesternDigits = (value: string): string =>
  value.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));

export const formatArabicNumber = (
  value: number | string,
  options?: Intl.NumberFormatOptions
): string => {
  const numericValue =
    typeof value === 'number'
      ? value
      : Number(toWesternDigits(String(value ?? '')).replace(/[^\d.-]/g, ''));

  if (!Number.isFinite(numericValue)) {
    return toArabicDigits(value);
  }

  return new Intl.NumberFormat('ar-EG', options).format(numericValue);
};

export const toArabicDigits = (value: string | number | null | undefined): string =>
  String(value ?? '').replace(/[0-9]/g, (digit) => EASTERN_ARABIC_DIGITS[Number(digit)]);

const PROTECTED_TOKEN_PATTERN =
  /(https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,})/g;

export const toArabicDigitsSafe = (text: string): string => {
  if (!text || !/[0-9]/.test(text)) return text;

  const parts = text.split(PROTECTED_TOKEN_PATTERN);
  return parts
    .map((part, index) => (index % 2 === 1 ? part : toArabicDigits(part)))
    .join('');
};

export const formatArabicCurrency = (
  value: number | string,
  suffix = 'ج.م'
): string => `${formatArabicNumber(value)} ${suffix}`.trim();

export const formatArabicBadgeCount = (count: number, max = 99): string =>
  count > max ? `+${formatArabicNumber(max)}` : formatArabicNumber(count);
