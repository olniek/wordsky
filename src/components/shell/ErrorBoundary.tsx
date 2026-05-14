import { Component, type ErrorInfo, type ReactNode } from 'react'
import { strings } from '../../lib/strings'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    void error
    void info
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="app-error-fallback" role="alert">
          <h1 className="app-error-fallback-title">{strings.app.errorTitle}</h1>
          <p className="app-error-fallback-body">{strings.app.errorBody}</p>
          <button
            type="button"
            className="app-error-fallback-reload"
            onClick={() => window.location.reload()}
          >
            {strings.app.errorReload}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
