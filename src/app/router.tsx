import { Routes, Route, Link } from 'react-router-dom'

interface PlaceholderScreenProps {
  readonly name: string
  readonly nextPath: string
  readonly nextLabel: string
}

function PlaceholderScreen({ name, nextPath, nextLabel }: PlaceholderScreenProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">{name}</h1>
      <p className="text-sm text-gray-500 border border-dashed px-2 py-1">
        PLACEHOLDER — not yet implemented
      </p>
      <Link to={nextPath} className="text-blue-500 underline">
        {nextLabel} →
      </Link>
    </div>
  )
}

export function AppRouter(): JSX.Element {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PlaceholderScreen name="Onboarding" nextPath="/select-planet" nextLabel="Select Planet" />
        }
      />
      <Route
        path="/select-planet"
        element={
          <PlaceholderScreen name="Planet Selection" nextPath="/select-crew" nextLabel="Select Crew" />
        }
      />
      <Route
        path="/select-crew"
        element={
          <PlaceholderScreen
            name="Crew Selection"
            nextPath="/configure-base"
            nextLabel="Configure Base"
          />
        }
      />
      <Route
        path="/configure-base"
        element={
          <PlaceholderScreen
            name="Base Configuration"
            nextPath="/mission"
            nextLabel="Start Mission"
          />
        }
      />
      <Route
        path="/mission"
        element={
          <PlaceholderScreen name="Mission Control" nextPath="/debrief" nextLabel="End Mission" />
        }
      />
      <Route
        path="/debrief"
        element={
          <PlaceholderScreen name="Mission Debrief" nextPath="/" nextLabel="Play Again" />
        }
      />
    </Routes>
  )
}
