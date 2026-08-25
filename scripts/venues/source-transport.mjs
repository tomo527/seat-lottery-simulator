// Transport policy for recorded provenance URLs.
//
// A recorded URL is provenance and audit metadata only. No build step and no
// runtime path dereferences it, and the generated catalog and runtime JSON never
// carry it. HTTPS therefore stays mandatory wherever the issuer serves it, while
// a current first-party issuer that offers no working HTTPS endpoint may be
// recorded at its real http:// URL under an explicit, machine-checkable waiver.
// Rewriting such a URL to an invented https:// address stays prohibited, and the
// waiver never relaxes any seat-evidence gate.
//
// Source metadata, inventory metadata, and the production database test all
// evaluate the policy through this module so the three gates cannot drift.

import { WARNING_LIMITS } from './constants.mjs'

export const HTTP_ONLY_OFFICIAL_WAIVER_KEY = 'httpOnlyOfficial'

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const domainPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const canonicalString = (value) => typeof value === 'string' && value.length > 0 && value === value.trim()

const parseDate = (value) => {
  if (!datePattern.test(value ?? '')) return undefined
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value ? undefined : parsed
}

/** The source validator tracks today as a Date, the inventory validator as YYYY-MM-DD text. */
const asDate = (value) => (value instanceof Date ? value : parseDate(value))

/** Accepts the issuer domain itself and any host below it, so a www or media host stays covered. */
const hostMatchesIssuerDomain = (host, issuerDomain) => host === issuerDomain || host.endsWith(`.${issuerDomain}`)

/**
 * Evaluates one recorded URL against the transport policy.
 *
 * `httpsRequiredMessage` stays caller-supplied so each existing gate keeps its
 * established wording for the plain "no HTTPS, no waiver" rejection.
 */
export const evaluateRecordedUrlTransport = ({
  url,
  official,
  waiver,
  prefix,
  field,
  today,
  httpsRequiredMessage,
}) => {
  const errors = []
  const warnings = []
  const waiverLabel = `${prefix} ${field} ${HTTP_ONLY_OFFICIAL_WAIVER_KEY}`
  const waiverPresent = waiver !== undefined && waiver !== null

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    // Reported as a missing HTTPS URL below, matching the established wording.
  }

  if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
    errors.push(httpsRequiredMessage)
    return { errors, warnings }
  }

  if (parsed.protocol === 'https:') {
    if (waiverPresent) {
      errors.push(`${waiverLabel} must be removed because the URL already uses HTTPS`)
    }
    return { errors, warnings }
  }

  if (!waiverPresent) {
    errors.push(httpsRequiredMessage)
    return { errors, warnings }
  }
  if (official !== true) {
    errors.push(`${waiverLabel} is allowed only on an official issuer source`)
    return { errors, warnings }
  }
  if (!isPlainObject(waiver)) {
    errors.push(`${waiverLabel} must be a plain object`)
    return { errors, warnings }
  }

  const issuerDomain = waiver.issuerDomain
  if (!canonicalString(issuerDomain) || !domainPattern.test(issuerDomain)) {
    errors.push(`${waiverLabel}.issuerDomain must be a lowercase issuer domain`)
  } else if (!hostMatchesIssuerDomain(parsed.hostname.toLowerCase(), issuerDomain)) {
    errors.push(`${waiverLabel}.issuerDomain ${issuerDomain} does not match URL host ${parsed.hostname.toLowerCase()}`)
  }

  const httpsCheckedAt = parseDate(waiver.httpsCheckedAt)
  const todayDate = asDate(today)
  if (!httpsCheckedAt) {
    errors.push(`${waiverLabel}.httpsCheckedAt must be a valid YYYY-MM-DD date`)
  } else if (todayDate && httpsCheckedAt > todayDate) {
    errors.push(`${waiverLabel}.httpsCheckedAt is in the future`)
  } else if (todayDate) {
    const ageDays = Math.floor((todayDate - httpsCheckedAt) / 86_400_000)
    if (ageDays > WARNING_LIMITS.httpsRecheckDays) {
      warnings.push(`${waiverLabel}.httpsCheckedAt was confirmed ${ageDays} days ago; recheck whether the issuer now serves HTTPS`)
    }
  }

  if (!canonicalString(waiver.httpsUnavailableEvidence)) {
    errors.push(`${waiverLabel}.httpsUnavailableEvidence must be a non-empty canonical string`)
  }

  if (errors.length === 0) {
    warnings.push(`${prefix} ${field} records the issuer's http:// URL under an ${HTTP_ONLY_OFFICIAL_WAIVER_KEY} waiver; migrate to HTTPS once the issuer serves it`)
  }
  return { errors, warnings }
}

/** True when the recorded URL satisfies the transport policy outright. */
export const recordedUrlTransportIsValid = (input) => evaluateRecordedUrlTransport(input).errors.length === 0
