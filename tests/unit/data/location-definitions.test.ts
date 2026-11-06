// tests/unit/data/location-definitions.test.ts
// Unit tests for location definitions — verify all locations have valid modifiers.

import { describe, it, expect } from 'vitest'
import {
  MOON_LOCATIONS,
  MARS_LOCATIONS,
  getLocationsForPlanet,
  getLocationById,
} from '@data/locations/location-definitions'

describe('Location Definitions', () => {
  describe('MOON_LOCATIONS', () => {
    it('should have exactly 3 locations', () => {
      expect(MOON_LOCATIONS).toHaveLength(3)
    })

    it('should have valid solar efficiency modifiers (0.6–1.0)', () => {
      for (const location of MOON_LOCATIONS) {
        expect(location.solarEfficiencyModifier).toBeGreaterThanOrEqual(0.6)
        expect(location.solarEfficiencyModifier).toBeLessThanOrEqual(1.0)
      }
    })

    it('should have positive thermal swing factors', () => {
      for (const location of MOON_LOCATIONS) {
        expect(location.thermalSwingFactor).toBeGreaterThan(0)
      }
    })

    it('should have zero dust storm probability (no atmosphere)', () => {
      for (const location of MOON_LOCATIONS) {
        expect(location.dustStormProbability).toBe(0)
      }
    })

    it('should have planetId = "moon"', () => {
      for (const location of MOON_LOCATIONS) {
        expect(location.planetId).toBe('moon')
      }
    })

    it('should have unique IDs', () => {
      const ids = MOON_LOCATIONS.map((loc) => loc.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(MOON_LOCATIONS.length)
    })

    it('should have non-empty names and descriptions', () => {
      for (const location of MOON_LOCATIONS) {
        expect(location.name).toBeTruthy()
        expect(location.description).toBeTruthy()
      }
    })
  })

  describe('MARS_LOCATIONS', () => {
    it('should have exactly 3 locations', () => {
      expect(MARS_LOCATIONS).toHaveLength(3)
    })

    it('should have valid solar efficiency modifiers (0.6–1.0)', () => {
      for (const location of MARS_LOCATIONS) {
        expect(location.solarEfficiencyModifier).toBeGreaterThanOrEqual(0.6)
        expect(location.solarEfficiencyModifier).toBeLessThanOrEqual(1.0)
      }
    })

    it('should have positive thermal swing factors', () => {
      for (const location of MARS_LOCATIONS) {
        expect(location.thermalSwingFactor).toBeGreaterThan(0)
      }
    })

    it('should have valid dust storm probability (0–1)', () => {
      for (const location of MARS_LOCATIONS) {
        expect(location.dustStormProbability).toBeGreaterThanOrEqual(0)
        expect(location.dustStormProbability).toBeLessThanOrEqual(1.0)
      }
    })

    it('should have planetId = "mars"', () => {
      for (const location of MARS_LOCATIONS) {
        expect(location.planetId).toBe('mars')
      }
    })

    it('should have unique IDs', () => {
      const ids = MARS_LOCATIONS.map((loc) => loc.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(MARS_LOCATIONS.length)
    })

    it('should have non-empty names and descriptions', () => {
      for (const location of MARS_LOCATIONS) {
        expect(location.name).toBeTruthy()
        expect(location.description).toBeTruthy()
      }
    })
  })

  describe('getLocationsForPlanet', () => {
    it('should return Moon locations when planetId = "moon"', () => {
      const locations = getLocationsForPlanet('moon')
      expect(locations).toEqual(MOON_LOCATIONS)
    })

    it('should return Mars locations when planetId = "mars"', () => {
      const locations = getLocationsForPlanet('mars')
      expect(locations).toEqual(MARS_LOCATIONS)
    })
  })

  describe('getLocationById', () => {
    it('should return the correct location for a valid Moon ID', () => {
      const location = getLocationById('moon-tranquillitatis')
      expect(location).not.toBeNull()
      expect(location?.name).toBe('Mare Tranquillitatis')
      expect(location?.planetId).toBe('moon')
    })

    it('should return the correct location for a valid Mars ID', () => {
      const location = getLocationById('mars-jezero')
      expect(location).not.toBeNull()
      expect(location?.name).toBe('Jezero Crater')
      expect(location?.planetId).toBe('mars')
    })

    it('should return null for an invalid ID', () => {
      const location = getLocationById('invalid-location-id')
      expect(location).toBeNull()
    })
  })
})
