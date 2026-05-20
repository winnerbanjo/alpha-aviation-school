export const COUNTRIES = [
  { iso: "NG", flag: "🇳🇬", name: "Nigeria", dialCode: "+234" },
  { iso: "GH", flag: "🇬🇭", name: "Ghana", dialCode: "+233" },
  { iso: "KE", flag: "🇰🇪", name: "Kenya", dialCode: "+254" },
  { iso: "ZA", flag: "🇿🇦", name: "South Africa", dialCode: "+27" },
  { iso: "AE", flag: "🇦🇪", name: "United Arab Emirates", dialCode: "+971" },
  { iso: "GB", flag: "🇬🇧", name: "United Kingdom", dialCode: "+44" },
  { iso: "US", flag: "🇺🇸", name: "United States", dialCode: "+1" },
] as const;

export type Country = (typeof COUNTRIES)[number];

export const digitsOnly = (value: string) => value.replace(/\D/g, "");

export const normalizeDialCode = (dialCode: string) => digitsOnly(dialCode);

export const findCountryFromValue = (value: string): Country => {
  const digits = digitsOnly(value);
  return (
    [...COUNTRIES]
      .sort(
        (a, b) =>
          normalizeDialCode(b.dialCode).length -
          normalizeDialCode(a.dialCode).length,
      )
      .find((country) => digits.startsWith(normalizeDialCode(country.dialCode))) ||
    COUNTRIES[0]
  );
};

export const getNationalNumber = (value: string, country: Country) => {
  const digits = digitsOnly(value);
  const countryDigits = normalizeDialCode(country.dialCode);
  if (digits.startsWith(countryDigits)) return digits.slice(countryDigits.length);
  return digits;
};

export const buildPhoneValue = (country: Country, nationalNumber: string) => {
  if (!nationalNumber) return "";
  return `${country.dialCode}${nationalNumber}`;
};

export const isValidPhoneNumber = (value: string) => {
  const digits = digitsOnly(value);
  return digits.length >= 7 && digits.length <= 15;
};
