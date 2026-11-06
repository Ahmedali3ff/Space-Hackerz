// src/components/game/NasaKidAstronaut.tsx
// Pure CSS/div kid astronaut character — no SVG files, no Three.js.
// Three poses: standing | thumbsUp | walking.
// The component floats via the sh-float keyframe defined in src/index.css.

export type AstronautPose = 'standing' | 'thumbsUp' | 'walking'

interface NasaKidAstronautProps {
  readonly pose?: AstronautPose
  readonly size?: number // px — default 200
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Scale a base-200 pixel value to the chosen `size`. */
function px(base: number, size: number): string {
  return `${(base / 200) * size}px`
}

// ─── sub-components (flat styled-div helpers) ───────────────────────────────

interface AstronautPartsProps {
  readonly size: number
  readonly pose: AstronautPose
}

function Helmet({ size }: Readonly<{ size: number }>): JSX.Element {
  const w = px(90, size)
  const h = px(90, size)
  const top = px(0, size)
  const visorW = px(58, size)
  const visorH = px(38, size)
  const visorTop = px(32, size)
  const visorLeft = px(16, size)
  const dot1Size = px(9, size)
  const dot2Size = px(6, size)
  const rimSize = px(4, size)

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        marginTop: top,
        alignSelf: 'center',
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #E8EDF2 55%, #D0D9E4 100%)',
        border: `${rimSize} solid #B0C4DE`,
        boxShadow:
          `0 ${px(2, size)} ${px(8, size)} rgba(0,0,0,0.18), inset 0 ${px(2, size)} ${px(4, size)} rgba(255,255,255,0.6)`,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {/* Visor */}
      <div
        style={{
          position: 'absolute',
          top: visorTop,
          left: visorLeft,
          width: visorW,
          height: visorH,
          borderRadius: px(20, size),
          background:
            'radial-gradient(ellipse at 30% 30%, #2a3e6a 0%, #1a2a4a 60%, #0d1a33 100%)',
          boxShadow: `inset 0 ${px(2, size)} ${px(6, size)} rgba(0,0,0,0.5)`,
        }}
      >
        {/* Highlight dot 1 */}
        <div
          style={{
            position: 'absolute',
            top: px(6, size),
            left: px(8, size),
            width: dot1Size,
            height: dot1Size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.75)',
          }}
        />
        {/* Highlight dot 2 */}
        <div
          style={{
            position: 'absolute',
            top: px(14, size),
            left: px(18, size),
            width: dot2Size,
            height: dot2Size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
          }}
        />
      </div>
    </div>
  )
}

function Body({ size }: Readonly<{ size: number }>): JSX.Element {
  const w = px(70, size)
  const h = px(72, size)
  const badgeW = px(30, size)
  const badgeH = px(14, size)
  const badgeFontSize = px(8, size)
  const lineH = px(2, size)
  const borderRadius = px(14, size)

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        alignSelf: 'center',
        borderRadius,
        background: 'linear-gradient(170deg, #F8F9FA 0%, #F0F0F0 60%, #E4E8ED 100%)',
        border: `${px(1.5, size)} solid #D0D9E4`,
        boxShadow: `0 ${px(2, size)} ${px(8, size)} rgba(0,0,0,0.12)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: px(10, size),
        gap: px(4, size),
      }}
      aria-hidden="true"
    >
      {/* Horizontal detail line 1 */}
      <div
        style={{
          width: '70%',
          height: lineH,
          background: '#1A2A4A',
          borderRadius: px(2, size),
          opacity: 0.35,
        }}
      />
      {/* NASA badge */}
      <div
        style={{
          width: badgeW,
          height: badgeH,
          background: '#CC0000',
          borderRadius: px(3, size),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: badgeFontSize,
            lineHeight: 1,
            letterSpacing: '0.08em',
            fontFamily: 'Nunito, system-ui, sans-serif',
          }}
        >
          NASA
        </span>
      </div>
      {/* Horizontal detail line 2 */}
      <div
        style={{
          width: '70%',
          height: lineH,
          background: '#1A2A4A',
          borderRadius: px(2, size),
          opacity: 0.35,
        }}
      />
    </div>
  )
}

function Arms({ size, pose }: AstronautPartsProps): JSX.Element {
  const armW = px(16, size)
  const armH = px(46, size)
  const borderRadius = px(10, size)
  const armStyle: React.CSSProperties = {
    width: armW,
    height: armH,
    borderRadius,
    background: 'linear-gradient(170deg, #F8F9FA 0%, #E8EAEE 100%)',
    border: `${px(1.5, size)} solid #C8D0DA`,
    position: 'absolute',
    top: px(96, size),
  }

  // Right arm angle depends on pose
  const rightArmRotate = pose === 'thumbsUp' ? '-45deg' : '12deg'
  const rightArmTop = pose === 'thumbsUp' ? px(72, size) : px(96, size)

  return (
    <>
      {/* Left arm */}
      <div
        style={{
          ...armStyle,
          left: px(12, size),
          transform: 'rotate(-12deg)',
          transformOrigin: 'top center',
        }}
        aria-hidden="true"
      />
      {/* Right arm */}
      <div
        style={{
          ...armStyle,
          right: px(12, size),
          top: rightArmTop,
          transform: `rotate(${rightArmRotate})`,
          transformOrigin: 'top center',
        }}
        aria-hidden="true"
      />
      {/* Thumbs-up emoji floating near raised right arm */}
      {pose === 'thumbsUp' && (
        <div
          style={{
            position: 'absolute',
            top: px(100, size),
            right: px(2, size),
            fontSize: px(20, size),
            lineHeight: 1,
            animation: 'sh-float 2s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
          aria-label="thumbs up"
          role="img"
        >
          👍
        </div>
      )}
    </>
  )
}

function Legs({ size, pose }: AstronautPartsProps): JSX.Element {
  const legW = px(20, size)
  const legH = px(38, size)
  const bootH = px(10, size)
  const borderRadius = px(10, size)
  const bootBorderRadius = px(6, size)
  const gapFromBody = px(162, size)

  const leftLegRotate = pose === 'walking' ? '-18deg' : '0deg'
  const rightLegRotate = pose === 'walking' ? '18deg' : '0deg'

  function Leg({
    side,
    rotate,
  }: Readonly<{ side: 'left' | 'right'; rotate: string }>): JSX.Element {
    const xOffset = side === 'left' ? px(30, size) : px(50, size)
    return (
      <div
        style={{
          position: 'absolute',
          top: gapFromBody,
          left: xOffset,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `rotate(${rotate})`,
          transformOrigin: 'top center',
        }}
        aria-hidden="true"
      >
        {/* Leg segment */}
        <div
          style={{
            width: legW,
            height: legH,
            borderRadius,
            background: 'linear-gradient(170deg, #F4F4F6 0%, #EAEAEE 100%)',
            border: `${px(1.5, size)} solid #C8D0DA`,
          }}
        />
        {/* Boot */}
        <div
          style={{
            width: px(24, size),
            height: bootH,
            marginTop: px(-2, size),
            borderRadius: bootBorderRadius,
            background: 'linear-gradient(170deg, #8090A0 0%, #6A7A8A 100%)',
            border: `${px(1, size)} solid #5A6A7A`,
          }}
        />
      </div>
    )
  }

  return (
    <>
      <Leg side="left" rotate={leftLegRotate} />
      <Leg side="right" rotate={rightLegRotate} />
    </>
  )
}

// ─── main component ──────────────────────────────────────────────────────────

export function NasaKidAstronaut({
  pose = 'standing',
  size = 200,
}: NasaKidAstronautProps): JSX.Element {
  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'sh-float 3s ease-in-out infinite',
      }}
      role="img"
      aria-label={`Kid astronaut — ${pose} pose`}
    >
      <Helmet size={size} />
      <Body size={size} />
      <Arms size={size} pose={pose} />
      <Legs size={size} pose={pose} />
    </div>
  )
}
