// src/components/common/PrimaryButton.tsx
// Primary CTA / secondary / ghost button. Min 48px target (56px for lg).
// Press scale + hover lift via Framer Motion; visible focus ring via CSS.
// When `to` is set and the button is enabled, it renders an animated
// react-router <Link> so navigation is a real <a> (keyboard/screen-reader
// friendly, supports open-in-new-tab). Disabled links are meaningless, so
// a disabled `to` falls back to a disabled <button>.

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Transition } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'md' | 'lg'

interface PrimaryButtonProps {
  readonly children: ReactNode
  readonly onClick?: () => void
  readonly to?: string
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
  readonly disabled?: boolean
  readonly type?: 'button' | 'submit'
  readonly ariaLabel?: string
  readonly className?: string
}

const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary: 'bg-accent-ignition text-space-void hover:shadow-glow-ignition',
  secondary:
    'bg-space-panelRaised text-text-primary border border-border-strong hover:border-accent-orbit/60',
  ghost: 'bg-transparent text-text-secondary hover:bg-space-panel hover:text-text-primary',
}

const SPRING: Transition = { type: 'spring', stiffness: 400, damping: 22 }

// Wrap react-router's Link once at module scope (never per render).
const MotionLink = motion.create(Link)

export function PrimaryButton({
  children,
  onClick,
  to,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  ariaLabel,
  className = '',
}: PrimaryButtonProps): JSX.Element {
  const sizeClass = size === 'lg' ? 'min-h-14 px-8 text-lg' : 'min-h-12 px-6 text-base'
  const classes = `inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-wide select-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none ${sizeClass} ${VARIANT_CLASSES[variant]} ${className}`
  const motionProps = {
    whileTap: disabled ? undefined : { scale: 0.97 },
    whileHover: disabled ? undefined : { y: -2 },
    transition: SPRING,
  }

  if (to !== undefined && !disabled) {
    return (
      <MotionLink to={to} className={classes} aria-label={ariaLabel} {...motionProps}>
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {children}
    </motion.button>
  )
}
