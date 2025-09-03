import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
        >
          <div 
            className="max-w-md w-full rounded-xl p-6 border text-center"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default
            }}
          >
            <AlertCircle 
              className="w-12 h-12 mx-auto mb-4" 
              style={{ color: sigmatiqTheme.colors.status.error }}
            />
            <h2 
              className="text-lg font-semibold mb-2"
              style={{ color: sigmatiqTheme.colors.text.primary }}
            >
              Something went wrong
            </h2>
            <p 
              className="text-sm mb-4"
              style={{ color: sigmatiqTheme.colors.text.secondary }}
            >
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: sigmatiqTheme.colors.primary.teal,
                color: sigmatiqTheme.colors.background.primary
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;