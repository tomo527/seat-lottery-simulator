import { describe, expect, it } from 'vitest'
import { deriveTokyoCoverageContract } from './coverage-contract.mjs'

const coverage = (overrides = {}) => ({
  releaseGate: {
    releaseReady: true,
    requirements: { rawProductionFloor: { MUST: 1, SHOULD: 1, MUST_AND_SHOULD: 2, TOKYO_UNIVERSE: 2 } },
  },
  coverageMetrics: {
    schemaAddressableCoverage: {
      confirmedCurrentSchemaNonProductionIds: [],
      confirmedSchemaExtensionNonProductionIds: [],
    },
  },
  universeGapReview: { status: 'complete', blockerIds: [] },
  releaseCoverageAdequacyReview: { status: 'pending', blockerIds: ['TOKYO-RELEASE-COVERAGE-ADEQUACY-REVIEW'] },
  candidates: [
    { id: 'must', tier: 'MUST', inventoryState: 'PRODUCTION' },
    { id: 'should', tier: 'SHOULD', inventoryState: 'PRODUCTION' },
  ],
  ...overrides,
})
const capabilities = { multiConfiguration: true, fixedOnlyDisclosure: true, configurationLevelProductionGate: true }

describe('deterministic Tokyo release coverage contract', () => {
  it('ignores a manual releaseReady flag and requires the adequacy review', () => {
    const result = deriveTokyoCoverageContract({ coverage: coverage(), productionCandidateIds: ['must', 'should'], capabilities })
    expect(result.gates.releaseCoverageAdequacyReview.status).toBe('FAIL')
    expect(result.releaseReady).toBe(false)
  })

  it('does not shrink the addressable cohort when a formally production venue disappears from runtime state', () => {
    const result = deriveTokyoCoverageContract({ coverage: coverage(), productionCandidateIds: ['should'], capabilities })
    expect(result.gates.mustAddressableProductionConversion).toMatchObject({ status: 'FAIL', numerator: 0, denominator: 1, blockerIds: ['must'] })
  })

  it('derives YES only when every Tokyo gate passes and does not accept a legacy regional input', () => {
    const input = coverage({ releaseCoverageAdequacyReview: { status: 'complete', blockerIds: [] } })
    const result = deriveTokyoCoverageContract({ coverage: input, productionCandidateIds: ['must', 'should'], capabilities, legacyReleaseReady: false })
    expect(result.coverageGateResult).toBe('PASS')
    expect(result.releaseReady).toBe(true)
  })

  it('adds newly classified SHOULD candidates to both addressable conversion and the dynamic floor', () => {
    const input = coverage({
      releaseCoverageAdequacyReview: { status: 'complete', blockerIds: [] },
      candidates: [
        { id: 'must', tier: 'MUST', inventoryState: 'PRODUCTION' },
        { id: 'should', tier: 'SHOULD', inventoryState: 'PRODUCTION' },
        { id: 'new-addressable', tier: 'SHOULD', inventoryState: 'HOLD', schemaAddressability: 'schema-v2' },
      ],
    })
    const result = deriveTokyoCoverageContract({ coverage: input, productionCandidateIds: ['must', 'should'], capabilities })
    expect(result.dynamicShouldIds).toEqual(['new-addressable'])
    expect(result.gates.shouldAddressableProductionConversion).toMatchObject({ status: 'FAIL', numerator: 1, denominator: 2, blockerIds: ['new-addressable'] })
    expect(result.rawProductionFloor.should).toEqual({ numerator: 2, denominator: 2 })
    expect(result.addressableConversionProgress.should).toMatchObject({ status: 'FAIL', numerator: 1, denominator: 2 })
    expect(result.gates.rawProductionFloorAttainmentShould).toMatchObject({ status: 'FAIL', numerator: 1, denominator: 2 })
  })
})
