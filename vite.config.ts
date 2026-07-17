import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { realVenues } from './src/data/venues/realVenues.js'
import { countRegisteredSeats, validateProductionVenues } from './src/domain/venues/validateVenueData.js'

const venueDataIssues = validateProductionVenues(realVenues)
if (venueDataIssues.length > 0) {
  throw new Error(`Production venue data is invalid:\n${venueDataIssues.map((issue) => `${issue.venueId} [${issue.code}] ${issue.message}`).join('\n')}`)
}
console.info('[venue-data]', {
  venues: realVenues.length,
  registeredSeats: Object.fromEntries(realVenues.map((venue) => [venue.id, countRegisteredSeats(venue)])),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
})
