import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { BATCH_STATUSES, INVENTORY_PRIORITIES, LEGACY_PRODUCTION_IDS } from './constants.mjs'
import { BATCH_DIR } from './lib.mjs'
import { normalizeSearchText } from './validation.mjs'

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const readBatches = async (batchDir = BATCH_DIR) => {
  const files = (await readdir(batchDir).catch((error) => {
    if (error.code === 'ENOENT') return []
    throw error
  })).filter((file) => file.endsWith('.json')).sort()
  return Promise.all(files.map(async (file) => {
    try {
      return { file, data: JSON.parse(await readFile(path.join(batchDir, file), 'utf8')) }
    } catch (error) {
      throw new Error(`${file}: invalid batch JSON: ${error.message}`, { cause: error })
    }
  }))
}

export const batchVenueIds = (batch) => {
  if (Array.isArray(batch?.targetVenueIds)) return batch.targetVenueIds
  if (Array.isArray(batch?.venues)) {
    return batch.venues.map((item) => typeof item === 'string' ? item : item?.venueSourceId ?? item?.venueId ?? item?.inventoryId)
  }
  return []
}

export const batchMembershipVenueIds = (batch) => [
  ...batchVenueIds(batch),
  ...(Array.isArray(batch?.supplementalVenueIds) ? batch.supplementalVenueIds : []),
]

export const validateBatches = (batches, inventoryItems = [], sources = []) => {
  const errors = []
  const ids = new Map()
  const crossBatchAssignments = new Map()
  const inventoryByKey = new Map(inventoryItems.flatMap((item) =>
    [item.venue.inventoryId, item.venue.venueSourceId].filter(Boolean).map((key) => [key, item.venue])))
  const inventoryKeys = new Set(inventoryItems.flatMap(({ venue }) => [venue.inventoryId, venue.venueSourceId].filter(Boolean)))
  for (const { file, data } of batches) {
    const label = `${file}:`
    if (!isPlainObject(data)) {
      errors.push(`${label} batch root must be an object`)
      continue
    }
    if (!slugPattern.test(data.batchId ?? '')) errors.push(`${label} batchId must be a stable slug`)
    if (file !== `${data.batchId}.json`) errors.push(`${label} filename must match batchId`)
    if (ids.has(data.batchId)) errors.push(`${label} duplicate batchId also used by ${ids.get(data.batchId)}`)
    else ids.set(data.batchId, file)
    if (!datePattern.test(data.createdAt ?? '')) errors.push(`${label} createdAt must be YYYY-MM-DD`)
    if (typeof data.scope !== 'string' || !data.scope.trim() || data.scope !== data.scope.trim()) errors.push(`${label} scope must be a non-empty canonical string`)
    if (!BATCH_STATUSES.has(data.status)) errors.push(`${label} unknown status ${String(data.status)}`)
    if (data.priority !== undefined && !INVENTORY_PRIORITIES.has(data.priority)) errors.push(`${label} unknown priority ${String(data.priority)}`)
    if (!Array.isArray(data.targetVenueIds) && !Array.isArray(data.venues)) errors.push(`${label} targetVenueIds or venues must be an array`)
    if (data.supplementalVenueIds !== undefined && !Array.isArray(data.supplementalVenueIds)) {
      errors.push(`${label} supplementalVenueIds must be an array`)
    }
    const venueIds = batchMembershipVenueIds(data)
    const seen = new Set()
    venueIds.forEach((venueId, index) => {
      if (typeof venueId !== 'string' || !venueId) errors.push(`${label} target ${index} is missing a venue ID`)
      else if (seen.has(venueId)) errors.push(`${label} duplicates target venue ${venueId}`)
      else {
        seen.add(venueId)
        if (!inventoryKeys.has(venueId)) errors.push(`${label} references venue not present in inventory: ${venueId}`)
        else {
          const inventory = inventoryByKey.get(venueId)
          const canonicalId = inventory?.inventoryId ?? venueId
          const identityKeys = inventory
            ? [
                `inventory:${inventory.inventoryId}`,
                inventory.venueSourceId ? `source:${inventory.venueSourceId}` : null,
                `facility-space:${normalizeSearchText(`${inventory.facilityName} ${inventory.spaceName ?? ''}`)}`,
                `name-city:${normalizeSearchText(`${inventory.officialDisplayName} ${inventory.city}`)}`,
              ].filter(Boolean)
            : [`inventory:${canonicalId}`]
          const previous = identityKeys.map((key) => crossBatchAssignments.get(key)).find(Boolean)
          const carryOver = Array.isArray(data.carryOvers)
            ? data.carryOvers.find((item) => item?.inventoryId === canonicalId)
            : undefined
          if (previous && !carryOver) {
            errors.push(`${label} target ${venueId} duplicates inventory venue ${canonicalId} already assigned to ${previous}; use an explicit carryOver record`)
          } else if (previous && carryOver) {
            if (carryOver.carryOverFrom !== previous) errors.push(`${label} carryOver for ${canonicalId} must reference ${previous}`)
            if (typeof carryOver.previousStatus !== 'string' || !carryOver.previousStatus) errors.push(`${label} carryOver for ${canonicalId} requires previousStatus`)
            if (typeof carryOver.recheckReason !== 'string' || !carryOver.recheckReason.trim()) errors.push(`${label} carryOver for ${canonicalId} requires recheckReason`)
            if (!datePattern.test(carryOver.recheckNotBefore ?? '')) errors.push(`${label} carryOver for ${canonicalId} requires recheckNotBefore`)
          }
          if (!previous) identityKeys.forEach((key) => crossBatchAssignments.set(key, data.batchId))
        }
      }
    })
  }
  if (sources.length) {
    const assignedInventoryIds = new Set()
    for (const { data } of batches) {
      for (const venueId of batchMembershipVenueIds(data)) {
        const inventory = inventoryByKey.get(venueId)
        if (inventory) assignedInventoryIds.add(inventory.inventoryId)
      }
    }
    const productionSourceIds = new Set(sources
      .filter(({ data }) => data?.status === 'production' && data?.prefecture === '東京都' && !LEGACY_PRODUCTION_IDS.has(data.id))
      .map(({ data }) => data.id))
    for (const sourceId of [...productionSourceIds].sort()) {
      const inventory = inventoryByKey.get(sourceId)
      if (inventory && !assignedInventoryIds.has(inventory.inventoryId)) {
        errors.push(`${inventory.inventoryId}: production source ${sourceId} is not assigned to any batch`)
      }
    }
  }
  return { errors }
}

export const resolveBatch = (batchId, batches, inventoryItems) => {
  const wrapped = batches.find(({ data }) => data?.batchId === batchId)
  if (!wrapped) throw new Error(`Batch not found: ${batchId}`)
  const byKey = new Map(inventoryItems.flatMap((item) =>
    [item.venue.inventoryId, item.venue.venueSourceId].filter(Boolean).map((key) => [key, item])))
  return {
    ...wrapped,
    items: batchVenueIds(wrapped.data).map((id) => ({ targetId: id, inventory: byKey.get(id) })),
    supplementalItems: (wrapped.data.supplementalVenueIds ?? []).map((id) => ({ targetId: id, inventory: byKey.get(id) })),
  }
}

export const formatBatchReport = (resolved, batchValidation) => {
  const statuses = new Map()
  for (const { inventory } of resolved.items) {
    const status = inventory?.venue.researchStatus ?? 'missing'
    statuses.set(status, (statuses.get(status) ?? 0) + 1)
  }
  const production = statuses.get('production') ?? 0
  const blocked = statuses.get('blocked') ?? 0
  const rejected = statuses.get('rejected') ?? 0
  const missing = statuses.get('missing') ?? 0
  const draft = resolved.items.length - production - blocked - rejected - missing
  const firstPassComplete = ['first-pass-complete', 'independent-review-in-progress', 'independent-review-mismatch', 'independent-review-complete', 'production']
    .reduce((total, status) => total + (statuses.get(status) ?? 0), 0)
  const independentReviewComplete = (statuses.get('independent-review-complete') ?? 0) + production
  const independentReviewMismatch = statuses.get('independent-review-mismatch') ?? 0
  return [
    `Batch: ${resolved.data.batchId}`,
    `Status: ${resolved.data.status}`,
    `Scope: ${resolved.data.scope}`,
    `Targets: ${resolved.items.length}`,
    `Workflow summary: production=${production}, draft=${draft}, blocked=${blocked}, rejected=${rejected}, missing=${missing}`,
    `Stage summary: first-pass-complete-or-later=${firstPassComplete}, independent-review-complete=${independentReviewComplete}, independent-review-mismatch=${independentReviewMismatch}`,
    `Supplemental membership: ${resolved.supplementalItems.length}`,
    ...resolved.supplementalItems.map(({ targetId, inventory }) =>
      `  ${targetId}: ${inventory?.venue.officialDisplayName ?? '(missing inventory)'} | ${inventory?.venue.researchStatus ?? 'missing'}`),
    'Research status:',
    ...[...statuses].sort(([left], [right]) => left.localeCompare(right)).map(([status, count]) => `  ${status}: ${count}`),
    'Targets:',
    ...resolved.items.map(({ targetId, inventory }) => {
      const venue = inventory?.venue
      return `  ${targetId}: ${venue?.officialDisplayName ?? '(missing inventory)'} | ${venue?.researchStatus ?? 'missing'} | ${venue?.priority ?? '-'}`
    }),
    'Batch validation errors:',
    ...(batchValidation.errors.length ? batchValidation.errors.map((error) => `  ${error}`) : ['  (none)']),
  ].join('\n')
}
