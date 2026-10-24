import { isValidPhoneNumber } from "libphonenumber-js/max";

export function isValidInternationalPhone(value?: string | null): boolean {
  if (!value?.trim()) return false;
  try {
    return isValidPhoneNumber(value.trim());
  } catch {
    return false;
  }
}
