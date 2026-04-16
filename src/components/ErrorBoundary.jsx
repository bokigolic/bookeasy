import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: '#05050f' }}
      >
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" style={{ color: '#f87171' }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.5} />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            An unexpected error occurred. Try refreshing the page.
          </p>
          {this.state.error && (
            <pre
              className="text-left text-xs mb-6 p-4 rounded-xl overflow-auto"
              style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}
