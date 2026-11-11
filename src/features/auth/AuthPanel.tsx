import { useState } from 'react'
import { useAuthStore } from '@store/auth-store'

interface AuthPanelProps { readonly onClose: () => void }

export function AuthPanel({ onClose }: AuthPanelProps): JSX.Element {
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const signIn = useAuthStore((state) => state.signIn)
  const register = useAuthStore((state) => state.register)

  function submit(): void {
    const success = mode === 'signin' ? signIn(username, password) : register(username, password)
    if (!success) { setError(mode === 'signin' ? 'Account not found or password is incorrect.' : 'Use a unique username (3+ characters) and password (4+ characters).'); return }
    onClose()
  }

  return <div className="sh-auth-backdrop" role="dialog" aria-modal="true" aria-label="Commander sign in" onClick={onClose}>
    <form className="sh-auth-card" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); submit() }}>
      <span className="sh-eyebrow">Space Hackerz account</span><h2>{mode === 'signin' ? 'Welcome back, Commander' : 'Create commander account'}</h2>
      <p>Save your campaign progress and return to your missions on this device.</p>
      <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="commander" /></label>
      <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} type="password" placeholder="••••••••" /></label>
      {error && <div className="sh-auth-error" role="alert">{error}</div>}
      <button className="sh-auth-submit" type="submit">{mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
      <button className="sh-auth-switch" type="button" onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setError('') }}>{mode === 'signin' ? 'New commander? Create an account' : 'Already have an account? Sign in'}</button>
      <button className="sh-auth-close" type="button" onClick={onClose}>Continue as guest</button>
    </form>
  </div>
}
