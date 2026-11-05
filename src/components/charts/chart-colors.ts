// src/components/charts/chart-colors.ts
// Shared chart color constants that match the ASTRA Space+ design token palette.
// Use these for Recharts stroke/fill and axis/grid/tooltip styling.

export const CHART_COLORS = {
  oxygen: '#1FC8C0',  // Space+ primary teal
  water: '#4DD0E1',   // light teal-blue for differentiation
  food: '#66BB6A',    // green — food/plant semantic
  energy: '#F59E0B',  // amber — energy/power semantic
} as const

export const CHART_AXIS_COLOR = '#6B7280'      // Space+ text.body
export const CHART_GRID_COLOR = '#E5E7EB'      // Space+ border
export const CHART_TOOLTIP_BG = '#FFFFFF'      // white card
export const CHART_TOOLTIP_BORDER = '#E5E7EB'  // light border
export const CHART_TOOLTIP_TEXT = '#1A1D2E'    // heading text
