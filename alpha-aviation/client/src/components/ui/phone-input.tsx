import { type ChangeEvent, useState } from "react";
import {
  buildPhoneValue,
  COUNTRIES,
  type Country,
  digitsOnly,
  findCountryFromValue,
  getNationalNumber,
} from "@/lib/phone";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
}

export function PhoneNumberInput({
  value,
  onChange,
  disabled = false,
  required = false,
  autoFocus = false,
  className = "",
  inputClassName = "",
}: PhoneNumberInputProps) {
  const [countryIso, setCountryIso] = useState<Country["iso"]>(
    () => findCountryFromValue(value).iso,
  );
  const fallbackCountry =
    COUNTRIES.find((item) => item.iso === countryIso) || COUNTRIES[0];
  const country = value ? findCountryFromValue(value) : fallbackCountry;
  const nationalNumber = getNationalNumber(value, country);

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCountry =
      COUNTRIES.find((item) => item.iso === event.target.value) || COUNTRIES[0];
    setCountryIso(nextCountry.iso);
    onChange(buildPhoneValue(nextCountry, nationalNumber));
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextNumber = digitsOnly(event.target.value).slice(0, 14);
    onChange(buildPhoneValue(country, nextNumber));
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={country.iso}
        onChange={handleCountryChange}
        disabled={disabled}
        className="w-[122px] shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0061FF] focus:ring-4 focus:ring-[#0061FF]/10 disabled:bg-slate-50 disabled:text-slate-500"
        aria-label="Country code"
      >
        {COUNTRIES.map((item) => (
          <option key={item.iso} value={item.iso}>
            {item.flag} {item.dialCode}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={nationalNumber}
        onChange={handleNumberChange}
        onPaste={(event) => {
          event.preventDefault();
          const pasted = digitsOnly(event.clipboardData.getData("text")).slice(
            0,
            14,
          );
          onChange(buildPhoneValue(country, pasted));
        }}
        disabled={disabled}
        required={required}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="tel-national"
        autoFocus={autoFocus}
        className={`min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0061FF] focus:ring-4 focus:ring-[#0061FF]/10 disabled:bg-slate-50 disabled:text-slate-500 ${inputClassName}`}
        placeholder="8012345678"
        aria-label="Phone number"
      />
    </div>
  );
}
