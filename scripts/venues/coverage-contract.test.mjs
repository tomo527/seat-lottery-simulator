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
  representativeCoverageReleaseReview: { status: 'pending', blockerIds: ['TOKYO-REPRESENTATIVE-COVERAGE-RELEASE-REVIEW'] },
  candidates: [
    { id: 'must', tier: 'MUST', inventoryState: 'PRODUCTION' },
    { id: 'should', tier: 'SHOULD', inventoryState: 'PRODUCTION' },
  ],
  ...overrides,
})
const capabilities = { multiConfiguration: true, fixedOnlyDisclosure: true, configurationLevelProductionGate: true, representativeCoverageDisclosure: true }

describe('deterministic Tokyo release coverage contract', () => {
  it('ignores a manual releaseReady flag and requires the representative coverage review', () => {
    const result = deriveTokyoCoverageContract({ coverage: coverage(), productionCandidateIds: ['must', 'should'], capabilities })
    expect(result.gates.representativeCoverageReview.status).toBe('FAIL')
    expect(result.releaseReady).toBe(false)
  })

  it('does not shrink the addressable cohort when a formally production venue disappears from runtime state', () => {
    const result = deriveTokyoCoverageContract({ coverage: coverage(), productionCandidateIds: ['should'], capabilities })
    expect(result.addressableConversionProgress.must).toMatchObject({ status: 'FAIL', numerator: 0, denominator: 1, blockerIds: ['must'] })
    expect(result.nonProductionAddressableIds).toEqual(['must'])
  })

  it('derives YES only when every Tokyo gate passes and does not accept a legacy regional input', () => {
    const input = coverage({ representativeCoverageReleaseReview: { status: 'complete', blockerIds: [] } })
    const result = deriveTokyoCoverageContract({ coverage: input, productionCandidateIds: ['must', 'should'], capabilities, legacyReleaseReady: false })
    expect(result.coverageGateResult).toBe('PASS')
    expect(result.releaseReady).toBe(true)
  })

  it('adds newly classified SHOULD candidates to both addressable conversion and the dynamic floor', () => {
    const input = coverage({
      representativeCoverageReleaseReview: { status: 'complete', blockerIds: [] },
      candidates: [
        { id: 'must', tier: 'MUST', inventoryState: 'PRODUCTION' },
        { id: 'should', tier: 'SHOULD', inventoryState: 'PRODUCTION' },
        { id: 'new-addressable', tier: 'SHOULD', inventoryState: 'HOLD', schemaAddressability: 'schema-v2' },
      ],
    })
    const result = deriveTokyoCoverageContract({ coverage: input, productionCandidateIds: ['must', 'should'], capabilities })
    expect(result.dynamicShouldIds).toEqual(['new-addressable'])
    expect(result.nonProductionAddressableIds).toEqual(['new-addressable'])
    expect(result.rawProductionFloor.should).toEqual({ numerator: 2, denominator: 2 })
    expect(result.addressableConversionProgress.should).toMatchObject({ status: 'FAIL', numerator: 1, denominator: 2 })
    expect(result.releaseReady).toBe(true)
  })

  it('derives the raw floor from the current addressable cohort instead of a stale stored baseline', () => {
    const input = coverage({
      releaseGate: {
        requirements: { rawProductionFloor: { MUST: 2, SHOULD: 2, MUST_AND_SHOULD: 4, TOKYO_UNIVERSE: 4 } },
      },
    })
    const result = deriveTokyoCoverageContract({ coverage: input, productionCandidateIds: ['must', 'should'], capabilities })
    expect(result.rawProductionFloor.should).toEqual({ numerator: 1, denominator: 1 })
    expect(result.gates.representativeCoverageReview.status).toBe('FAIL')
  })

  it('requires the global representative-layout disclosure capability', () => {
    const input = coverage({ representativeCoverageReleaseReview: { status: 'complete', blockerIds: [] } })
    const result = deriveTokyoCoverageContract({ coverage: input, productionCandidateIds: ['must', 'should'], capabilities: { ...capabilities, representativeCoverageDisclosure: false } })
    expect(result.gates.representativeCoverageDisclosure).toMatchObject({ status: 'FAIL', blockerIds: ['PLATFORM-REPRESENTATIVE-COVERAGE-DISCLOSURE'] })
    expect(result.releaseReady).toBe(false)
  })
})
