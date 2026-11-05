// src/components/feedback/EventAlertCard.tsx
// White card with teal left border presenting a simulation event + choice buttons.
// Choices are rendered as PrimaryButton variants (primary for first, secondary rest).

import { PrimaryButton } from '@/components/common/PrimaryButton'

interface EventChoice {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly isOptimal: boolean
}

interface EventAlertCardProps {
  readonly eventId: string
  readonly title: string
  readonly description: string
  readonly scientificNote?: string
  readonly choices: ReadonlyArray<EventChoice>
  readonly onChoose: (choiceId: string) => void
}

export function EventAlertCard({
  eventId: _eventId,
  title,
  description,
  scientificNote,
  choices,
  onChoose,
}: EventAlertCardProps): JSX.Element {
  return (
    <div className="sp-card border-l-4 border-l-spaceplus-accent-teal p-5 flex flex-col gap-4">
      {/* Title */}
      <h3 className="font-display2 text-lg font-bold text-spaceplus-text-heading">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-spaceplus-text-body">
        {description}
      </p>

      {/* Optional scientific note */}
      {scientificNote !== undefined ? (
        <p className="text-sm italic text-spaceplus-text-secondary border-l-2 border-spaceplus-accent-tealLight pl-3">
          {scientificNote}
        </p>
      ) : null}

      {/* Choice buttons */}
      <div className="flex flex-col gap-2" role="group" aria-label={`Choices for ${title}`}>
        {choices.map((choice, index) => (
          <div key={choice.id} className="flex flex-col gap-1">
            <PrimaryButton
              variant={index === 0 ? 'hint' : 'secondary'}
              onClick={() => { onChoose(choice.id) }}
              ariaLabel={`${choice.label} — ${title}`}
            >
              {choice.label}
            </PrimaryButton>
            {choice.description.length > 0 ? (
              <p className="text-xs text-spaceplus-text-secondary pl-1">
                {choice.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
