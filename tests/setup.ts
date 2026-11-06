import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// ── React Three Fiber mocks ──────────────────────────────────────────────────
// These mocks ensure R3F components can be tested in jsdom without WebGL.

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ camera: {}, gl: {}, scene: {} })),
}))

vi.mock('@react-three/drei', () => ({
  Stars: () => null,
  OrbitControls: () => null,
  Html: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'r3f-html' }, children),
  Sparkles: () => null,
  Environment: () => null,
  Text: () => null,
}))

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  Bloom: () => null,
  Vignette: () => null,
}))
