export type GuideTopic = "format" | "limits" | "next-steps"
export type Normalization = "digits" | "alphanumeric" | "tax-code"

export type TaxIdFormat = {
  id: string
  label: string
  normalization: Normalization
  pattern: RegExp
  hint: string
}

export type TaxIdCountry = {
  id: string
  code: string
  name: string
  formats: TaxIdFormat[]
}

export const COUNTRIES: TaxIdCountry[] = [
  {
    id: "US", code: "US", name: "United States", formats: [
      { id: "ssn", label: "Social Security number (SSN)", normalization: "digits", pattern: /^\d{9}$/, hint: "9 digits; hyphens are optional." },
      { id: "ein", label: "Employer identification number (EIN)", normalization: "digits", pattern: /^\d{9}$/, hint: "9 digits; hyphens are optional." },
    ],
  },
  { id: "CA", code: "CA", name: "Canada", formats: [{ id: "sin", label: "Social Insurance Number (SIN)", normalization: "digits", pattern: /^\d{9}$/, hint: "9 digits; spaces and hyphens are optional." }] },
  {
    id: "GB", code: "GB", name: "United Kingdom", formats: [
      { id: "nino", label: "National Insurance number", normalization: "alphanumeric", pattern: /^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]?$/, hint: "2 letters, 6 digits, and an optional final letter." },
      { id: "utr", label: "Unique Taxpayer Reference (UTR)", normalization: "digits", pattern: /^\d{10}$/, hint: "10 digits; spaces are optional." },
    ],
  },
  { id: "MX", code: "MX", name: "Mexico", formats: [{ id: "rfc", label: "Federal Taxpayer Registry (RFC)", normalization: "tax-code", pattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, hint: "12 or 13 letters and digits; separators are optional." }] },
  {
    id: "IN", code: "IN", name: "India", formats: [
      { id: "pan", label: "Permanent Account Number (PAN)", normalization: "alphanumeric", pattern: /^[A-Z]{5}\d{4}[A-Z]$/, hint: "5 letters, 4 digits, and 1 letter." },
      { id: "gstin", label: "Goods and Services Tax ID (GSTIN)", normalization: "alphanumeric", pattern: /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/, hint: "15 letters and digits." },
    ],
  },
  {
    id: "AU", code: "AU", name: "Australia", formats: [
      { id: "tfn", label: "Tax File Number (TFN)", normalization: "digits", pattern: /^\d{8,9}$/, hint: "8 or 9 digits." },
      { id: "abn", label: "Australian Business Number (ABN)", normalization: "digits", pattern: /^\d{11}$/, hint: "11 digits." },
    ],
  },
  { id: "DE", code: "DE", name: "Germany", formats: [{ id: "steuer-id", label: "Tax Identification Number (Steuer-ID)", normalization: "digits", pattern: /^\d{11}$/, hint: "11 digits." }] },
  { id: "FR", code: "FR", name: "France", formats: [{ id: "numero-fiscal", label: "Numéro fiscal", normalization: "digits", pattern: /^\d{13}$/, hint: "13 digits." }] },
  {
    id: "BR", code: "BR", name: "Brazil", formats: [
      { id: "cpf", label: "Individual Taxpayer Registry (CPF)", normalization: "digits", pattern: /^\d{11}$/, hint: "11 digits." },
      { id: "cnpj", label: "National Registry of Legal Entities (CNPJ)", normalization: "digits", pattern: /^\d{14}$/, hint: "14 digits." },
    ],
  },
  {
    id: "JP", code: "JP", name: "Japan", formats: [
      { id: "my-number", label: "Individual Number (My Number)", normalization: "digits", pattern: /^\d{12}$/, hint: "12 digits." },
      { id: "corporate-number", label: "Corporate Number", normalization: "digits", pattern: /^\d{13}$/, hint: "13 digits." },
    ],
  },
  { id: "SG", code: "SG", name: "Singapore", formats: [{ id: "nric-fin", label: "NRIC / FIN", normalization: "alphanumeric", pattern: /^[STFGM]\d{7}[A-Z]$/, hint: "1 letter, 7 digits, and 1 letter." }] },
  { id: "IE", code: "IE", name: "Ireland", formats: [{ id: "ppsn", label: "Personal Public Service Number (PPSN)", normalization: "alphanumeric", pattern: /^\d{7}[A-Z]{1,2}$/, hint: "7 digits followed by 1 or 2 letters." }] },
  { id: "NL", code: "NL", name: "Netherlands", formats: [{ id: "bsn", label: "Citizen Service Number (BSN)", normalization: "digits", pattern: /^\d{8,9}$/, hint: "8 or 9 digits." }] },
  { id: "ZA", code: "ZA", name: "South Africa", formats: [{ id: "tax-reference", label: "Tax reference number", normalization: "digits", pattern: /^\d{10}$/, hint: "10 digits." }] },
  { id: "PL", code: "PL", name: "Poland", formats: [{ id: "nip", label: "Tax Identification Number (NIP)", normalization: "digits", pattern: /^\d{10}$/, hint: "10 digits." }] },
  { id: "AE", code: "AE", name: "United Arab Emirates", formats: [{ id: "trn", label: "Tax Registration Number (TRN)", normalization: "digits", pattern: /^\d{15}$/, hint: "15 digits." }] },
  { id: "NZ", code: "NZ", name: "New Zealand", formats: [{ id: "ird", label: "IRD number", normalization: "digits", pattern: /^\d{8,9}$/, hint: "8 or 9 digits." }] },
  { id: "ES", code: "ES", name: "Spain", formats: [{ id: "nif-nie", label: "NIF / NIE", normalization: "alphanumeric", pattern: /^(?:\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/, hint: "8 digits and a letter, or an NIE prefix with a check letter." }] },
  {
    id: "TR", code: "TR", name: "Türkiye", formats: [
      { id: "tckn", label: "Turkish Identification Number (TCKN)", normalization: "digits", pattern: /^\d{11}$/, hint: "11 digits." },
      { id: "vkn", label: "Tax Identification Number (VKN)", normalization: "digits", pattern: /^\d{10}$/, hint: "10 digits." },
    ],
  },
]

export function normalizeTin(value: string, normalization: Normalization): string {
  const upperCaseValue = value.toLocaleUpperCase("en-US")
  if (normalization === "digits") return upperCaseValue.replace(/\D/g, "")
  if (normalization === "tax-code") return upperCaseValue.replace(/[^A-Z0-9Ñ&]/g, "")
  return upperCaseValue.replace(/[^A-Z0-9]/g, "")
}

export function findTaxIdFormat(countryId: string, formatId: string): TaxIdFormat | undefined {
  return COUNTRIES.find((country) => country.id === countryId)?.formats.find((format) => format.id === formatId)
}
