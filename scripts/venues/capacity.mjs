import { SIZE_LIMITS, SIZE_PROJECTION_COUNTS } from './constants.mjs'

const percentileMedian = (values) => {
  if (!values.length) return 0
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

export const analyzeDatabaseSizes = ({ catalogBytes, detailBytes, venueCount, projectionCounts = SIZE_PROJECTION_COUNTS }) => {
  const details = [...detailBytes]
  const detailTotal = details.reduce((sum, value) => sum + value, 0)
  const averageDetailBytes = details.length ? Math.round(detailTotal / details.length) : 0
  const medianDetailBytes = percentileMedian(details)
  const maxDetailBytes = details.length ? Math.max(...details) : 0
  const catalogBytesPerVenue = venueCount ? catalogBytes / venueCount : 0
  const projections = projectionCounts.map((count) => ({
    venueCount: count,
    catalogBytes: Math.round(catalogBytesPerVenue * count),
    detailBytes: Math.round(averageDetailBytes * count),
    databaseBytes: Math.round((catalogBytesPerVenue + averageDetailBytes) * count),
  }))
  return {
    catalogBytes,
    detailTotal,
    databaseBytes: catalogBytes + detailTotal,
    averageDetailBytes,
    medianDetailBytes,
    maxDetailBytes,
    projections,
  }
}

export const evaluateSizeLimits = (analysis, limits = SIZE_LIMITS) => {
  const errors = []
  const warnings = []
  const check = (label, bytes, limit) => {
    if (bytes >= limit.hard) errors.push(`${label} is ${bytes} bytes; hard limit is under ${limit.hard.toLocaleString('en-US')} bytes`)
    else if (bytes >= limit.soft) warnings.push(`${label} is ${bytes} bytes; soft limit is under ${limit.soft.toLocaleString('en-US')} bytes`)
  }
  check('catalog', analysis.catalogBytes, limits.catalogBytes)
  check('generated database', analysis.databaseBytes, limits.databaseBytes)
  analysis.detailSizes?.forEach(({ file, bytes }) => check(file, bytes, limits.detailBytes))
  for (const projection of analysis.projections) {
    if (projection.catalogBytes >= limits.catalogBytes.soft) {
      warnings.push(`${projection.venueCount}-venue catalog projection is ${projection.catalogBytes} bytes and exceeds the catalog soft limit`)
    }
    if (projection.databaseBytes >= limits.databaseBytes.soft) {
      warnings.push(`${projection.venueCount}-venue database projection is ${projection.databaseBytes} bytes and exceeds the database soft limit`)
    }
  }
  return { errors, warnings }
}
