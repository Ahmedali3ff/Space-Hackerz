import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/app/router'
import { GlobalProviders } from '@/app/providers/GlobalProviders'

export default function App(): JSX.Element {
  return (
    <GlobalProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </GlobalProviders>
  )
}
