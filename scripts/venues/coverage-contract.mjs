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
  const nonProductionAddressableIds = candidates
    .filter((candidate) => addressableIds.has(candidate.id) && !productionIds.has(candidate.id))
    .map(({ id }) => id)
    .sort()
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

  const productionCount = (items) => items.filter((candidate) => productionIds.has(candidate.id)).length
  const mustItems = byTier('MUST')
  const shouldItems = byTier('SHOULD')
  const mustAndShould = candidates.filter((candidate) => ['MUST', 'SHOULD'].includes(candidate.tier))
  const addressableRequired = (addressableItems) => addressableItems.filter((candidate) => addressableIds.has(candidate.id)).length
  const floorMetric = (universeItems, required) => ({
    numerator: required,
    denominator: universeItems.length,
  })
  const floorAttainmentGate = (items, required, blockerIds) => {
    const actual = productionCount(items)
    return {
      status: actual >= required ? 'PASS' : 'FAIL',
      numerator: actual,
      denominator: required,
      blockerIds: [...new Set(blockerIds)].sort(),
    }
  }
  const addressableBlockerIds = (items) => idsFor(items.filter((candidate) => addressableIds.has(candidate.id) && !productionIds.has(candidate.id)))

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
    rawProductionFloorAttainmentMust: floorAttainmentGate(mustItems, addressableRequired(mustItems), addressableBlockerIds(mustItems)),
    rawProductionFloorAttainmentShould: floorAttainmentGate(shouldItems, addressableRequired(shouldItems), addressableBlockerIds(shouldItems)),
    rawProductionFloorAttainmentMustAndShould: floorAttainmentGate(mustAndShould, addressableRequired(mustAndShould), addressableBlockerIds(mustAndShould)),
    rawProductionFloorAttainmentTokyo: floorAttainmentGate(candidates, addressableRequired(mustAndShould), addressableBlockerIds(mustAndShould)),
    configurationSupport,
    fixedOnlyDisclosure,
    productionQuality,
    universeGap,
    releaseCoverageAdequacyReview: adequacyReview,
  }
  return {
    metrics: { tokyo, must, should, optional },
    rawProductionFloor: {
      must: floorMetric(mustItems, addressableRequired(mustItems)),
      should: floorMetric(shouldItems, addressableRequired(shouldItems)),
      mustAndShould: floorMetric(mustAndShould, addressableRequired(mustAndShould)),
      tokyo: floorMetric(candidates, addressableRequired(mustAndShould)),
    },
    addressableConversionProgress: {
      must: addressableGate(mustItems),
      should: addressableGate(shouldItems),
      total: addressableGate(mustAndShould),
    },
    addressableIds: [...addressableIds].sort(),
    nonProductionAddressableIds,
    dynamicShouldIds: [...dynamicShouldIds].sort(),
    gates,
    coverageGateResult: Object.values(gates).every(({ status }) => status === 'PASS') ? 'PASS' : 'FAIL',
    releaseReady: Object.values(gates).every(({ status }) => status === 'PASS'),
  }
}
