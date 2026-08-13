const undispositionedState = '未調査'

const gate = (numerator, denominator, blockerIds = [], passWhenEmpty = true) => ({
  status: denominator === 0 ? (passWhenEmpty ? 'PASS' : 'FAIL') : numerator === denominator && blockerIds.length === 0 ? 'PASS' : 'FAIL',
  numerator,
  denominator,
  blockerIds: [...new Set(blockerIds)].sort(),
})

const idsFor = (items) => items.map(({ id }) => id)

export const deriveTokyoCoverageContract = ({
  coverage,
  productionCandidateIds,
  sourceValidationErrors = [],
  inventoryValidationErrors = [],
  capabilities,
}) => {
  const candidates = coverage.candidates ?? []
  const productionIds = new Set(productionCandidateIds)
  const currentAddressable = coverage.coverageMetrics?.schemaAddressableCoverage?.confirmedCurrentSchemaNonProductionIds ?? []
  const extensionAddressable = coverage.coverageMetrics?.schemaAddressableCoverage?.confirmedSchemaExtensionNonProductionIds ?? []
  const dispositionedProductionIds = candidates.filter((candidate) => candidate.inventoryState === 'PRODUCTION').map(({ id }) => id)
  const baselineAddressable = new Set([...dispositionedProductionIds, ...productionIds, ...currentAddressable, ...extensionAddressable])
  const dynamicShouldIds = candidates
    .filter((candidate) => candidate.tier === 'SHOULD' && ['current-schema', 'schema-v2'].includes(candidate.schemaAddressability) && !baselineAddressable.has(candidate.id))
    .map(({ id }) => id)
  const addressableIds = new Set([...baselineAddressable, ...dynamicShouldIds])
  const byTier = (tier) => candidates.filter((candidate) => candidate.tier === tier)
  const tierMetrics = (items) => ({
    research: gate(items.filter((candidate) => candidate.inventoryState !== undispositionedState).length, items.length, idsFor(items.filter((candidate) => candidate.inventoryState === undispositionedState))),
    production: gate(items.filter((candidate) => productionIds.has(candidate.id)).length, items.length, idsFor(items.filter((candidate) => !productionIds.has(candidate.id)))),
    addressable: gate(items.filter((candidate) => addressableIds.has(candidate.id)).length, items.length),
  })
  const tokyo = tierMetrics(candidates)
  const must = tierMetrics(byTier('MUST'))
  const should = tierMetrics(byTier('SHOULD'))
  const optional = tierMetrics(byTier('OPTIONAL'))
  const addressableGate = (items) => {
    const cohort = items.filter((candidate) => addressableIds.has(candidate.id))
    const converted = cohort.filter((candidate) => productionIds.has(candidate.id))
    return gate(converted.length, cohort.length, idsFor(cohort.filter((candidate) => !productionIds.has(candidate.id))))
  }

  const requirements = coverage.releaseGate?.requirements ?? {}
  const rawPolicy = requirements.rawProductionFloor ?? {}
  const productionCount = (items) => items.filter((candidate) => productionIds.has(candidate.id)).length
  const mustItems = byTier('MUST')
  const shouldItems = byTier('SHOULD')
  const mustAndShould = candidates.filter((candidate) => ['MUST', 'SHOULD'].includes(candidate.tier))
  const rawFloorRequired = (baselineRequired, addressableItems) => Math.max(
    Number(baselineRequired ?? 0),
    addressableItems.filter((candidate) => addressableIds.has(candidate.id)).length,
  )
  const rawFloorMetric = (universeItems, baselineRequired, addressableItems) => ({
    numerator: rawFloorRequired(baselineRequired, addressableItems),
    denominator: universeItems.length,
  })
  const rawFloorAttainmentGate = (items, baselineRequired, addressableItems) => {
    const required = rawFloorRequired(baselineRequired, addressableItems)
    const actual = productionCount(items)
    return {
      status: actual >= required ? 'PASS' : 'FAIL',
      numerator: actual,
      denominator: required,
      blockerIds: idsFor(addressableItems.filter((candidate) => addressableIds.has(candidate.id) && !productionIds.has(candidate.id))).sort(),
    }
  }

  const configurationSupport = gate(
    Number(capabilities?.multiConfiguration === true && capabilities?.configurationLevelProductionGate === true),
    1,
    capabilities?.multiConfiguration === true && capabilities?.configurationLevelProductionGate === true ? [] : ['PLATFORM-MULTI-CONFIGURATION'],
  )
  const fixedOnlyDisclosure = gate(
    Number(capabilities?.fixedOnlyDisclosure === true),
    1,
    capabilities?.fixedOnlyDisclosure === true ? [] : ['PLATFORM-FIXED-ONLY-DISCLOSURE'],
  )
  const qualityErrors = [...sourceValidationErrors, ...inventoryValidationErrors]
  const productionQuality = gate(Number(qualityErrors.length === 0), 1, qualityErrors.length ? qualityErrors : [])
  const universeBlockers = coverage.universeGapReview?.blockerIds ?? []
  const universeGap = gate(
    Number(coverage.universeGapReview?.status === 'complete' && universeBlockers.length === 0),
    1,
    coverage.universeGapReview?.status === 'complete' && universeBlockers.length === 0 ? [] : universeBlockers.length ? universeBlockers : ['TOKYO-UNIVERSE-GAP-REVIEW'],
  )
  const adequacyBlockers = coverage.releaseCoverageAdequacyReview?.blockerIds ?? []
  const adequacyReview = gate(
    Number(coverage.releaseCoverageAdequacyReview?.status === 'complete' && adequacyBlockers.length === 0),
    1,
    coverage.releaseCoverageAdequacyReview?.status === 'complete' && adequacyBlockers.length === 0 ? [] : adequacyBlockers.length ? adequacyBlockers : ['TOKYO-RELEASE-COVERAGE-ADEQUACY-REVIEW'],
  )

  const gates = {
    mustResearchCompleteness: must.research,
    shouldResearchCompleteness: should.research,
    mustAddressableProductionConversion: addressableGate(mustItems),
    shouldAddressableProductionConversion: addressableGate(shouldItems),
    dynamicShouldAddressableAdditions: addressableGate(candidates.filter((candidate) => dynamicShouldIds.includes(candidate.id))),
    rawProductionFloorAttainmentMust: rawFloorAttainmentGate(mustItems, rawPolicy.MUST, mustItems),
    rawProductionFloorAttainmentShould: rawFloorAttainmentGate(shouldItems, rawPolicy.SHOULD, shouldItems),
    rawProductionFloorAttainmentMustAndShould: rawFloorAttainmentGate(mustAndShould, rawPolicy.MUST_AND_SHOULD, mustAndShould),
    rawProductionFloorAttainmentTokyo: rawFloorAttainmentGate(candidates, rawPolicy.TOKYO_UNIVERSE, mustAndShould),
    configurationSupport,
    fixedOnlyDisclosure,
    productionQuality,
    universeGap,
    releaseCoverageAdequacyReview: adequacyReview,
  }
  return {
    metrics: { tokyo, must, should, optional },
    rawProductionFloor: {
      must: rawFloorMetric(mustItems, rawPolicy.MUST, mustItems),
      should: rawFloorMetric(shouldItems, rawPolicy.SHOULD, shouldItems),
      mustAndShould: rawFloorMetric(mustAndShould, rawPolicy.MUST_AND_SHOULD, mustAndShould),
      tokyo: rawFloorMetric(candidates, rawPolicy.TOKYO_UNIVERSE, mustAndShould),
    },
    addressableConversionProgress: {
      must: addressableGate(mustItems),
      should: addressableGate(shouldItems),
      total: addressableGate(mustAndShould),
    },
    addressableIds: [...addressableIds].sort(),
    dynamicShouldIds: [...dynamicShouldIds].sort(),
    gates,
    coverageGateResult: Object.values(gates).every(({ status }) => status === 'PASS') ? 'PASS' : 'FAIL',
    releaseReady: Object.values(gates).every(({ status }) => status === 'PASS'),
  }
}
