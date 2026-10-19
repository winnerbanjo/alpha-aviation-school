import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/layout/BrandLogo'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

const CHUNK_LOAD_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Loading chunk',
  'ChunkLoadError',
  'Importing a module script failed',
]

const CHUNK_RELOAD_FLAG = 'alpha-aviation-chunk-reload-attempted'

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)

    if (this.isChunkLoadError(error) && !this.hasReloadedForChunkError()) {
      this.markChunkReloadAttempted()
      window.location.reload()
    }
  }

  handleReset = () => {
    if (this.state.error && this.isChunkLoadError(this.state.error)) {
      window.location.reload()
      return
    }

    this.setState({ hasError: false, error: null })
  }

  hasReloadedForChunkError() {
    return window.sessionStorage.getItem(CHUNK_RELOAD_FLAG) === 'true'
  }

  markChunkReloadAttempted() {
    window.sessionStorage.setItem(CHUNK_RELOAD_FLAG, 'true')
  }

  isChunkLoadError(error: Error) {
    return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) =>
      error.message.includes(pattern),
    )
  }

  render() {
    if (this.state.hasError) {
      const isChunkLoadError =
        this.state.error !== null && this.isChunkLoadError(this.state.error)

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] px-4 py-10">
          <div className="relative w-full max-w-md overflow-hidden rounded-stage bg-[#07152E] text-white shadow-float">
            <div aria-hidden="true" className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
            <div aria-hidden="true" className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />
            <div className="relative p-8 text-center sm:p-10">
              <BrandLogo tone="white" className="mx-auto -mt-2 mb-8 w-[188px]" />
              <div className="mb-5 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-md">
                  <AlertTriangle className="h-6 w-6 text-[#8EAEFF]" />
                </div>
              </div>
              <h1 className="mb-3 text-2xl font-bold tracking-tighter text-white sm:text-3xl">
                {isChunkLoadError ? 'Update Required' : 'System Under Maintenance'}
              </h1>
              <p className="mb-8 text-sm leading-relaxed text-white/65">
                {isChunkLoadError
                  ? 'A newer version of the app is available, and one of the page assets could not be loaded. Reloading usually resolves this.'
                  : "We're experiencing a temporary issue. Our team has been notified and is working to resolve it."}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full rounded-full bg-[#1246C8] text-white shadow-glow hover:bg-[#0F3BAA] hover:shadow-glow-lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isChunkLoadError ? 'Reload Page' : 'Try Again'}
                </Button>
                <Button
                  onClick={() => { this.setState({ hasError: false, error: null }) }}
                  variant="outline"
                  className="w-full rounded-full border-white/25 bg-white/10 text-white backdrop-blur-md hover:border-white/25 hover:bg-white/20 hover:text-white"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
