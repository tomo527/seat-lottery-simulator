export const isSchemaV2 = (data) => data?.schemaVersion === 2

export const configurationRuntimeId = (venueId, configurationId) => `${venueId}--${configurationId}`

export const sourceConfigurations = (data) => {
  if (isSchemaV2(data)) return Array.isArray(data.configurations) ? data.configurations : []
  if (!data) return []
  return [{
    id: data.representativePattern?.id,
    canonicalName: data.representativePattern?.name,
    status: data.status,
    selectable: data.status === 'production',
    expectedSeatCount: data.representativePattern?.expectedSeatCount,
    ranges: data.ranges,
    verification: data.verification,
    sourceIds: Array.isArray(data.sources) ? data.sources.map((source) => source.id) : [],
    sourceGeneration: 'schema-v1-source',
    scope: { kind: 'full-venue' },
    scopeDisclosure: '',
    wheelchairSemantics: { status: 'legacy-reviewed' },
  }]
}

export const productionConfigurations = (data) => sourceConfigurations(data)
  .filter((configuration) => configuration.status === 'production' && configuration.selectable === true)

export const sourceHasProductionConfiguration = (data) => productionConfigurations(data).length > 0
