import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers/AppProviders'
import { router } from './app/router/router'

const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
)

export default App
