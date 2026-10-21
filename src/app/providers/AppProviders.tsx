import { Suspense, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import '../../shared/config/i18n'
import { store } from '../store'
import { AppErrorBoundary } from './AppErrorBoundary'
import { AppLoading } from './AppLoading'
import { queryClient } from './query-client'

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <Suspense fallback={<AppLoading />}>{children}</Suspense>
      </AppErrorBoundary>
    </QueryClientProvider>
  </Provider>
)
