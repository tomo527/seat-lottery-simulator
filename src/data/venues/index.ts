import catalog from '../venue-db/catalog.generated.json'
import type { VenueCatalogEntry } from '../../types/venue'

export const venues = catalog as VenueCatalogEntry[]
