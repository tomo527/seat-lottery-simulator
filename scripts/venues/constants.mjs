export const SUPPORTED_SCHEMA_VERSIONS = new Set([1, 2])
export const SOURCE_STATUSES = new Set(['draft', 'production', 'rejected'])
export const VENUE_TYPES = new Set(['theater', 'hall', 'arena', 'stadium', 'dome'])
export const SOURCE_ROLES = new Set(['seat-structure', 'seat-count', 'facility', 'event-layout'])
export const PATTERN_COVERAGES = new Set(['draft', 'partial', 'complete'])
export const VERIFICATION_STATUSES = new Set(['pending', 'reviewed', 'verified'])
export const VERIFICATION_RESULTS = new Set(['pending', 'matched', 'mismatched'])
export const CONFIDENCE_LEVELS = new Set(['verified', 'representative', 'approximate'])
export const CONFIGURATION_AUTHORITIES = new Set(['issuer', 'official-event', 'representative-evidence'])
export const CONFIGURATION_SCOPES = new Set(['full-venue', 'official-variant', 'fixed-only', 'representative-event'])
export const WHEELCHAIR_STATUSES = new Set(['resolved', 'not-reflected', 'not-applicable', 'unknown', 'legacy-reviewed'])
export const PLATFORM_CAPABILITIES = Object.freeze({
  multiConfiguration: true,
  fixedOnlyDisclosure: true,
  configurationLevelProductionGate: true,
  representativeCoverageDisclosure: true,
})
export const LEGACY_VERIFICATION_METHOD = 'legacy-official-source-metadata-review-and-range-reconciliation'
export const INDEPENDENT_VERIFICATION_METHOD = 'independent-official-source-review'
export const LEGACY_PRODUCTION_IDS = new Set([
  'hakuju-hall-standard',
  'hamarikyu-asahi-hall-standard',
  'iino-hall-standard',
  'kioi-small-hall-standard',
  'kyocera-dome-osaka-standard-baseball',
  'national-bunraku-theatre-standard',
  'oji-hall-standard',
  'sumida-triphony-small-hall-standard',
  'suntory-blue-rose-a',
  'tokyo-fm-hall-a-stage',
  'tokyo-geigeki-theatre-east-pattern-a',
  'toppan-hall-standard',
])

// Soft limits preserve the original review thresholds. Hard limits are
// deployment-safety gates and deliberately remain well below Cloudflare's
// per-asset ceiling. Keep all generated-database thresholds here.
export const SIZE_LIMITS = Object.freeze({
  catalogBytes: Object.freeze({ soft: 100_000, hard: 5_000_000 }),
  detailBytes: Object.freeze({ soft: 300_000, hard: 10_000_000 }),
  databaseBytes: Object.freeze({ soft: 2_000_000, hard: 100_000_000 }),
})

export const SIZE_PROJECTION_COUNTS = Object.freeze([100, 300, 500])

export const WARNING_LIMITS = Object.freeze({
  sourceAgeDays: 365,
  rangesPerRow: 25,
})

export const INVENTORY_OPERATIONAL_STATUSES = new Set([
  'active',
  'temporarily-closed',
  'renovation',
  'scheduled-to-open',
  'closed',
  'unknown',
])
export const INVENTORY_ELIGIBILITIES = new Set(['eligible', 'likely-eligible', 'ineligible', 'needs-research'])
export const INVENTORY_RESEARCH_STATUSES = new Set([
  'not-started',
  'source-located',
  'draft-created',
  'range-entry-in-progress',
  'first-pass-complete',
  'independent-review-pending',
  'independent-review-in-progress',
  'independent-review-mismatch',
  'independent-review-complete',
  'production',
  'rejected',
  'blocked',
])
export const INVENTORY_PRIORITIES = new Set(['A', 'B', 'C', 'D'])
// Discovery categories are intentionally broader than runtime venueType.
// In particular, official-list outdoor entries must not be misrepresented as
// stadiums merely to fit the production schema.
export const INVENTORY_CATEGORIES = new Set(['hall', 'theater', 'arena', 'stadium', 'dome', 'outdoor'])
export const BATCH_STATUSES = new Set(['planned', 'in-progress', 'complete', 'blocked'])
