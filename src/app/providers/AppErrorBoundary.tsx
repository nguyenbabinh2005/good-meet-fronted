import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-state">
          <div className="page-card">
            <h1>Something went wrong</h1>
            <p>Please refresh the page and try again.</p>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
