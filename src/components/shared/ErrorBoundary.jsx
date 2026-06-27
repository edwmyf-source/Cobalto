import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center page-enter">
          <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-danger-500" />
          </div>
          <h3 className="font-semibold text-lg text-ink-900 mb-1">Algo salió mal</h3>
          <p className="text-sm text-ink-900 max-w-sm mb-4">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl "
          >
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
