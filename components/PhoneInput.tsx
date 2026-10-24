"use client";

import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js";
import phoneMetadata from "libphonenumber-js/metadata.min.json";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = getCountries()
  .map((code) => ({
    code,
    name: countryNames.of(code) || code,
    callingCode: getCountryCallingCode(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
const countriesByCallingCode = [...countries].sort(
  (a, b) => b.callingCode.length - a.callingCode.length
);
const preferredCountriesByCallingCode: Record<string, CountryCode> = {
  "1": "US",
  "7": "RU",
  "44": "GB",
};
const countryMetadata = phoneMetadata.countries as Record<string, unknown[]>;

function getMaximumNationalDigits(country: CountryCode) {
  // India and Thailand contact numbers use at most 10 national digits.
  if (country === "IN" || country === "TH") return 10;

  const possibleLengths = countryMetadata[country]?.[3];
  if (Array.isArray(possibleLengths) && possibleLengths.length) {
    return Math.max(...possibleLengths.filter((length): length is number => typeof length === "number"));
  }
  return 15;
}

function getEntryDigitLimit(country: CountryCode, international: boolean) {
  const maximumNationalDigits = getMaximumNationalDigits(country);
  if (international || country === "IN" || country === "TH") {
    return maximumNationalDigits;
  }
  const nationalPrefix = countryMetadata[country]?.[5];
  return maximumNationalDigits + (typeof nationalPrefix === "string" ? nationalPrefix.length : 0);
}

function countryForCallingCode(digits: string) {
  const matches = countriesByCallingCode.filter(
    ({ callingCode }) => callingCode === digits
  );
  const preferred = preferredCountriesByCallingCode[digits];
  return matches.find(({ code }) => code === preferred) || matches[0] || null;
}

function flagEmoji(countryCode: string) {
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split("")
      .map((character) => 127397 + character.charCodeAt(0))
  );
}

function getInternationalInput(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("00")) return `+${trimmed.slice(2)}`;
  return null;
}

function sanitizePhoneInput(value: string) {
  return value
    .replace(/[^0-9+().\s-]/g, "")
    .replace(/(?!^)\+/g, "");
}

function detectCountry(value: string): CountryCode | null {
  const international = getInternationalInput(value);
  if (!international) return null;

  const parsed = parsePhoneNumberFromString(international, { extract: false });
  if (parsed?.country) return parsed.country;

  const digits = international.slice(1).replace(/\D/g, "");
  const prefix = countriesByCallingCode.find(({ callingCode }) =>
    digits.startsWith(callingCode)
  )?.callingCode;
  return prefix ? countryForCallingCode(prefix)?.code || null : null;
}

function storedPhone(value: string, country: CountryCode) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const international = getInternationalInput(trimmed);
  const parsed = international
    ? parsePhoneNumberFromString(international, { extract: false })
    : parsePhoneNumberFromString(trimmed, {
        defaultCountry: country,
        extract: false,
      });
  if (parsed) return parsed.number;

  const digits = trimmed.replace(/\D/g, "");
  if (international) return `+${digits}`;
  return `+${getCountryCallingCode(country)}${digits}`;
}

function initialInput(value: string) {
  const detected = detectCountry(value);
  const country = detected || "TH";
  const international = getInternationalInput(value);
  const parsed = international
    ? parsePhoneNumberFromString(international, { extract: false })
    : parsePhoneNumberFromString(value, {
        defaultCountry: country,
        extract: false,
      });

  return {
    country,
    nationalNumber: parsed?.country
      ? parsed.formatNational()
      : international
        ? value.replace(/^\s*(?:\+|00)/, "").replace(/\D/g, "")
        : value,
  };
}

export default function PhoneInput({
  value,
  onChange,
  disabled = false,
}: PhoneInputProps) {
  const [initial] = useState(() => initialInput(value));
  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [nationalNumber, setNationalNumber] = useState(initial.nationalNumber);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryPickerRef = useRef<HTMLDivElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const normalized = storedPhone(value, initial.country);
    if (value.trim() && normalized !== value) onChange(normalized);
    // Normalize pre-existing local-format records once when their form opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countryPickerOpen) countrySearchRef.current?.focus();
  }, [countryPickerOpen]);

  useEffect(() => {
    if (!countryPickerOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!countryPickerRef.current?.contains(event.target as Node)) {
        setCountryPickerOpen(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [countryPickerOpen]);

  const filteredCountries = countries.filter(({ code, name, callingCode }) => {
    const query = countrySearch.trim().toLowerCase().replace(/^\+/, "");
    return (
      !query ||
      name.toLowerCase().includes(query) ||
      code.toLowerCase().startsWith(query) ||
      callingCode.startsWith(query)
    );
  });

  const handleNumberChange = (input: string) => {
    input = sanitizePhoneInput(input);
    let international = getInternationalInput(input);
    const detected = international ? detectCountry(input) : null;
    const selectedCountry = detected || country;
    const maxDigits = getEntryDigitLimit(selectedCountry, Boolean(international));
    const allDigits = input.replace(/\D/g, "");
    const nationalDigitCount = international
      ? Math.max(0, allDigits.length - getCountryCallingCode(selectedCountry).length)
      : allDigits.length;
    if (nationalDigitCount > maxDigits) {
      if (international) {
        const callingCode = getCountryCallingCode(selectedCountry);
        input = `+${callingCode}${allDigits.slice(callingCode.length, callingCode.length + maxDigits)}`;
      } else {
        input = allDigits.slice(0, maxDigits);
      }
      international = getInternationalInput(input);
    }
    if (
      validatePhoneNumberLength(
        international || input,
        international ? undefined : selectedCountry
      ) === "TOO_LONG"
    ) {
      return;
    }
    const parsed = international
      ? parsePhoneNumberFromString(international, { extract: false })
      : parsePhoneNumberFromString(input, {
          defaultCountry: selectedCountry,
          extract: false,
        });

    setCountry(selectedCountry);
    if (international) {
      setNationalNumber(
        parsed?.country === selectedCountry
          ? parsed.formatNational()
          : input
              .replace(/^\s*(?:\+|00)/, "")
              .replace(/\D/g, "")
              .replace(new RegExp(`^${getCountryCallingCode(selectedCountry)}`), "")
      );
    } else {
      setNationalNumber(input);
    }
    onChange(storedPhone(input, selectedCountry));
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const input = event.currentTarget;
    const pastedText = sanitizePhoneInput(event.clipboardData.getData("text"));
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    handleNumberChange(
      `${input.value.slice(0, start)}${pastedText}${input.value.slice(end)}`
    );
  };

  const handleCountryChange = (nextCountry: CountryCode) => {
    setCountry(nextCountry);
    onChange(storedPhone(nationalNumber, nextCountry));
    setCountryPickerOpen(false);
    setCountrySearch("");
  };

  return (
    <div className="relative w-full" ref={countryPickerRef}>
      <div className="flex min-w-0 rounded-lg border border-neutral-200 bg-white focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200/60">
        <button
          type="button"
          aria-label="Choose country calling code"
          aria-expanded={countryPickerOpen}
          disabled={disabled}
          onClick={() => {
            setCountrySearch("");
            setCountryPickerOpen((open) => !open);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-l-lg border-r border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs text-neutral-800 hover:bg-neutral-100 focus:outline-none disabled:opacity-60"
        >
          <span className="text-sm">{flagEmoji(country)}</span>
          <span>+{getCountryCallingCode(country)}</span>
          <i className="bi bi-chevron-down text-[9px] text-neutral-500" />
        </button>
        <input
          type="tel"
          inputMode="tel"
          pattern="[0-9+(). -]*"
          autoComplete="tel-national"
          value={nationalNumber}
          onChange={(event) => handleNumberChange(event.target.value)}
          onPaste={handlePaste}
          placeholder="Phone number"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-r-lg px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none disabled:opacity-60"
        />
      </div>

      {countryPickerOpen && (
        <div className="absolute left-0 top-full z-[60] mt-1 w-72 max-w-[85vw] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
          <div className="border-b border-neutral-100 p-2.5">
            <div className="relative">
              <i className="bi bi-search absolute left-2.5 top-2.5 text-xs text-neutral-400" />
              <input
                ref={countrySearchRef}
                type="text"
                value={countrySearch}
                onChange={(event) => setCountrySearch(event.target.value)}
                placeholder="Search country or code"
                className="w-full rounded-lg border border-neutral-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-neutral-400"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredCountries.length ? (
              filteredCountries.map(({ code, name, callingCode: dialCode }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleCountryChange(code)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-neutral-100 ${country === code ? "bg-neutral-50 font-semibold" : ""}`}
                >
                  <span className="text-sm">{flagEmoji(code)}</span>
                  <span className="min-w-0 flex-1 truncate text-neutral-800">{name}</span>
                  <span className="font-mono text-neutral-500">+{dialCode}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-5 text-center text-xs text-neutral-500">
                No matching countries
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
