"use client"

import { useMemo, useState } from "react"
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Globe2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"
import { COUNTRIES, normalizeTin } from "@/lib/tin-formats"
import type { AssistantCheckContext } from "@/lib/chat-privacy"
import TinCheckAssistant from "@/components/tin-check-assistant"

type CheckResult = {
  valid: boolean
  countryName: string
  formatName: string
}

function BrandHeader() {
  return (
    <header className="app-header">
      <a className="brand" href="#top" aria-label="Shoulder Check home">
        <span className="brand-mark"><ShieldCheck aria-hidden="true" /></span>
        <span className="brand-name">shoulder<span>check</span></span>
        <span className="brand-divider" aria-hidden="true" />
        <span className="brand-product">TIN desk</span>
      </a>
      <div className="header-status"><span className="status-dot" />Privacy-first checker</div>
    </header>
  )
}

function CheckResultCard({ result }: { result: CheckResult }) {
  return (
    <div className={`result-card ${result.valid ? "result-positive" : "result-review"}`} role="status" aria-live="polite">
      <span className="result-icon">
        {result.valid ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
      </span>
      <div className="result-copy">
        <strong>{result.valid ? "Format looks right" : "Format needs a second look"}</strong>
        <p>
          {result.valid
            ? `The value matches the ${result.formatName} structure for ${result.countryName}. This does not confirm issuance or active status.`
            : `The value does not match the expected ${result.formatName} structure for ${result.countryName}. Check the selected ID type and formatting.`}
        </p>
      </div>
      <span className="result-tag">FORMAT ONLY</span>
    </div>
  )
}

export default function TinCheckApp() {
  const [countryId, setCountryId] = useState(COUNTRIES[0].id)
  const [formatId, setFormatId] = useState(COUNTRIES[0].formats[0].id)
  const [tinValue, setTinValue] = useState("")
  const [result, setResult] = useState<CheckResult | null>(null)
  const country = COUNTRIES.find((item) => item.id === countryId) ?? COUNTRIES[0]
  const format = country.formats.find((item) => item.id === formatId) ?? country.formats[0]
  const assistantCheckContext = useMemo<AssistantCheckContext | null>(() => {
    const taxId = normalizeTin(tinValue, format.normalization)
    if (!taxId) return null

    return {
      countryCode: country.code,
      countryName: country.name,
      taxIdType: format.label,
      taxId,
      formatResult: result ? (result.valid ? "matches" : "does_not_match") : "not_checked",
    }
  }, [country.code, country.name, format.label, format.normalization, result, tinValue])

  function handleCountryChange(nextCountryId: string) {
    const nextCountry = COUNTRIES.find((item) => item.id === nextCountryId) ?? COUNTRIES[0]
    setCountryId(nextCountry.id)
    setFormatId(nextCountry.formats[0].id)
    setTinValue("")
    setResult(null)
  }

  function handleCheck() {
    const normalizedValue = normalizeTin(tinValue, format.normalization)
    if (!normalizedValue) return

    setResult({
      valid: format.pattern.test(normalizedValue),
      countryName: country.name,
      formatName: format.label,
    })
  }

  return (
    <div className="app-shell" id="top">
      <BrandHeader />
      <main className="main-content">
        <section className="intro-section" aria-labelledby="page-title">
          <div className="eyebrow"><span className="eyebrow-line" /> GLOBAL TAX ID FORMAT CHECK</div>
          <div className="intro-row">
            <div>
              <h1 id="page-title">Know the format.<br /><span>Keep the number.</span></h1>
              <p className="intro-copy">Check a tax ID&apos;s structure across 19 jurisdictions. It stays in this browser unless you opt in to AI sharing.</p>
            </div>
            <div className="coverage-pill"><Globe2 aria-hidden="true" /><span>19 jurisdictions</span><span className="coverage-divider" /><span>Format-only</span></div>
          </div>
        </section>

        <section className="workspace-grid" aria-label="TIN format checker and AI assistant">
          <div className="checker-card">
            <div className="card-heading">
              <div>
                <span className="section-kicker">01 / FORMAT CHECK</span>
                <h2>Check a tax ID</h2>
              </div>
              <span className="local-badge"><LockKeyhole aria-hidden="true" /> LOCAL CHECK</span>
            </div>

            <div className="form-fields">
              <div className="field-group">
                <label htmlFor="country">Jurisdiction</label>
                <div className="select-wrap">
                  <select id="country" value={country.id} onChange={(event) => handleCountryChange(event.target.value)}>
                    {COUNTRIES.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.code}</option>)}
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="format">Tax ID type</label>
                <div className="select-wrap">
                  <select
                    id="format"
                    value={format.id}
                    onChange={(event) => {
                      setFormatId(event.target.value)
                      setResult(null)
                    }}
                  >
                    {country.formats.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
                <span className="field-hint">{format.hint}</span>
              </div>
              <div className="field-group tin-field">
                <label htmlFor="tin-value">Tax identification number</label>
                <input
                  id="tin-value"
                  type="text"
                  inputMode={format.normalization === "digits" ? "numeric" : "text"}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={32}
                  placeholder="Enter a tax ID to check"
                  value={tinValue}
                  onChange={(event) => {
                    setTinValue(event.target.value)
                    setResult(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                      event.preventDefault()
                      handleCheck()
                    }
                  }}
                  aria-describedby="privacy-note"
                />
                <span className="field-hint">Spaces and common separators are ignored.</span>
              </div>
            </div>

            <button className="check-button" type="button" onClick={handleCheck} disabled={!tinValue.trim()}>
              Check format <ArrowRight aria-hidden="true" />
            </button>
            <p className="privacy-note" id="privacy-note"><LockKeyhole aria-hidden="true" />The format check runs on this device. Your value is sent to AI only if you opt in within the assistant.</p>

            {result && <CheckResultCard result={result} />}

            <div className="official-note"><span className="note-mark"><Check aria-hidden="true" /></span><p><strong>Not an official verification.</strong> This checks structure only—not identity, ownership, or tax-authority records.</p></div>
          </div>

          <TinCheckAssistant checkContext={assistantCheckContext} />
        </section>

        <footer className="page-footer">
          <span><ShieldCheck aria-hidden="true" /> Built for careful checks</span>
          <span>Coverage includes common tax ID formats; requirements can vary by issuer.</span>
        </footer>
      </main>
    </div>
  )
}
