export const MAX_CHAT_MESSAGE_LENGTH = 2_000

export type AssistantCheckContext = {
  countryCode: string
  countryName: string
  taxIdType: string
  taxId: string
  formatResult: "matches" | "does_not_match" | "not_checked"
}

const sensitiveContentPatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b\d{2}-\d{7}\b/,
  /\b\d{9,}\b/,
  /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/,
  /\b(?:\+?1[ .-]?)?(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}\b/,
  /\b\d{1,6}\s+[\w.'-]+(?:\s+[\w.'-]+){0,3}\s+(?:street|st|road|rd|avenue|ave|boulevard|blvd|drive|dr|lane|ln|court|ct|highway|hwy)\b/i,
  /\b(?:my name is|name is|business name is|company name is|owner is|address is)\s+[A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,3}\b/i,
  /\b(?:TIN|SSN|EIN|ITIN|VAT(?:\s*ID)?|GSTIN|NINO|ABN)\s*(?:number|no\.?|is|:|=|#)\s*(?=[A-Z0-9-]{6,20}\b)(?=[A-Z0-9-]*\d)[A-Z0-9-]{6,20}\b/i,
]

const safeLabelPattern = /^[\p{L}\p{N} .,&'()/-]{1,80}$/u
const safeTaxIdPattern = /^[\p{L}\p{N}&-]{1,32}$/u

export function containsSensitiveData(text: string) {
  return sensitiveContentPatterns.some((pattern) => pattern.test(text))
}

export function isAssistantCheckContext(value: unknown): value is AssistantCheckContext {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false

  const context = value as Record<string, unknown>
  return (
    typeof context.countryCode === "string" && /^[A-Z]{2}$/.test(context.countryCode) &&
    typeof context.countryName === "string" && safeLabelPattern.test(context.countryName) &&
    typeof context.taxIdType === "string" && safeLabelPattern.test(context.taxIdType) &&
    typeof context.taxId === "string" && safeTaxIdPattern.test(context.taxId) &&
    (context.formatResult === "matches" || context.formatResult === "does_not_match" || context.formatResult === "not_checked")
  )
}
