// src/components/charts/chart-colors.ts
// Shared chart color constants that match the ASTRA design token palette.
// Use these for Recharts stroke/fill and axis/grid/tooltip styling.

export const CHART_COLORS = {
  oxygen: '#29E6F3',  // accent.orbit — matches status.info
  water: '#46E6A0',   // status.good
  food: '#FFC93C',    // status.warn
  energy: '#FF5A5F',  // status.crit
} as const

export const CHART_AXIS_COLOR = '#A9B8D4'    // text.secondary
export const CHART_GRID_COLOR = '#243456'    // border.subtle
export const CHART_TOOLTIP_BG = '#121C33'   // space.panel
export const CHART_TOOLTIP_BORDER = '#3A5180' // border.strong
export const CHART_TOOLTIP_TEXT = '#EAF1FA' // text.primary
