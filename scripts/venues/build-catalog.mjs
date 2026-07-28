import { buildVenueDatabase } from './atomic-build.mjs'

const { catalog } = await buildVenueDatabase()
console.log(`Built catalog for ${catalog.length} production venues.`)
