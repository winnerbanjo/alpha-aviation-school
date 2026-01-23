import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

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
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
          <Card className="border-slate-200/50 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                System Under Maintenance
              </h1>
              <p className="text-slate-500 mb-6">
                We're experiencing a temporary issue. Our team has been notified and is working to resolve it.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full rounded-lg bg-[#0061FF] hover:bg-[#0052E6] text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full rounded-lg border-slate-200/50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
