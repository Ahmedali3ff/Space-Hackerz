// src/features/astro/LearningSection.tsx
// Personalised learning: skill view, repeated weaknesses, and short practice questions with explanations.
import { useState } from 'react'
import { useLearningProfile } from '@/hooks/useLearningProfile'
import { optimalRate, practiceFor, repeatedMistakes } from '@/ai/learning/learning-profile'
import type { PracticeItem } from '@/ai/learning/learning-profile'
import type { ErrorResource } from '@/ai/errors/error-center'

const LABEL: Readonly<Record<ErrorResource, string>> = {
  oxygen: 'Oxygen', water: 'Water', food: 'Food', energy: 'Energy', radiation: 'Radiation', decision: 'Decisions',
}

export function LearningSection(): JSX.Element {
  const { profile } = useLearningProfile()
  const rate = optimalRate(profile)
  const weak = repeatedMistakes(profile)
  const practice = practiceFor(profile)

  return (
    <section aria-label="Personalised learning" className="flex flex-col gap-4">
      <div className="rounded-2xl astro-surface p-4 shadow-sm">
        <h2 className="text-base font-semibold astro-text">Your progress</h2>
        {rate === null ? (
          <p className="mt-2 text-sm astro-muted">Finish a mission to start tracking your decisions.</p>
        ) : (
          <>
            <p className="mt-2 text-sm astro-text">Optimal decisions: <span className="font-bold tabular-nums">{rate}%</span> across {profile.decisions} decisions.</p>
            <div role="progressbar" aria-label="Optimal decision rate" aria-valuemin={0} aria-valuemax={100} aria-valuenow={rate} className="mt-2 h-2 w-full overflow-hidden rounded-full astro-track">
              <div className="h-full rounded-full astro-accent-bg" style={{ width: `${rate}%` }} />
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl astro-surface p-4 shadow-sm">
        <h2 className="text-base font-semibold astro-text">Repeated mistakes</h2>
        {weak.length === 0 ? (
          <p className="mt-2 text-sm astro-ok">No repeated mistakes yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1 text-sm astro-text">
            {weak.map((r) => <li key={r}>{LABEL[r]}: {profile.mistakes[r]} similar mistakes</li>)}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold astro-text">Practice</h2>
        {practice.map((q) => <PracticeCard key={q.question} question={q} />)}
      </div>
    </section>
  )
}

function PracticeCard({ question }: { readonly question: PracticeItem }): JSX.Element {
  const [choice, setChoice] = useState<number | null>(null)
  const answered = choice !== null
  const correct = choice === question.correctIndex

  return (
    <fieldset className="rounded-2xl astro-surface p-4 shadow-sm">
      <legend className="px-1 text-sm font-semibold astro-text">{LABEL[question.resource]}: {question.question}</legend>
      <div className="mt-2 flex flex-col gap-2">
        {question.options.map((opt, i) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border astro-border px-3 py-2 text-sm astro-text">
            <input type="radio" name={question.question} checked={choice === i} onChange={() => setChoice(i)} className="astro-accent-input" />
            {opt}
          </label>
        ))}
      </div>
      {answered ? (
        <p role="status" className={`mt-3 text-sm ${correct ? 'astro-ok' : 'astro-warn'}`}>
          <span className="font-semibold">{correct ? '✓ Correct. ' : '! Not quite. '}</span>{question.explanation}
        </p>
      ) : null}
    </fieldset>
  )
}
