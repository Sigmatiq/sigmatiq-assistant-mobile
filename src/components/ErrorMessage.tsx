import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

interface ErrorMessageProps {
  error: any;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  // Extract error message from various error formats
  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.detail) return error.response.data.detail;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  // Determine error type for beginner-friendly messaging
  const getErrorType = () => {
    const message = getErrorMessage().toLowerCase();
    if (message.includes('provider not configured') || message.includes('api_key')) {
      return 'configuration';
    }
    if (message.includes('not available') || message.includes('not found')) {
      return 'availability';
    }
    if (message.includes('failed')) {
      return 'failure';
    }
    return 'generic';
  };

  const errorType = getErrorType();
  const message = getErrorMessage();

  // Beginner-friendly helper text based on error type
  const getHelperText = () => {
    switch (errorType) {
      case 'configuration':
        return 'The market data provider needs to be set up. Please contact support or check your API configuration.';
      case 'availability':
        return 'This service is temporarily unavailable. It may be outside market hours or undergoing maintenance.';
      case 'failure':
        return 'Something went wrong while fetching data. Please try again in a moment.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  };

  return (
    <div 
      className="rounded-lg p-4 border"
      style={{
        backgroundColor: sigmatiqTheme.colors.background.secondary,
        borderColor: sigmatiqTheme.colors.status.error + '40',
      }}
    >
      <div className="flex items-start gap-3">
        <AlertCircle 
          className="w-5 h-5 mt-0.5 flex-shrink-0" 
          style={{ color: sigmatiqTheme.colors.status.error }}
        />
        <div className="flex-1">
          <h3 
            className="font-medium text-sm mb-1"
            style={{ color: sigmatiqTheme.colors.text.primary }}
          >
            {errorType === 'configuration' ? 'Setup Required' :
             errorType === 'availability' ? 'Service Unavailable' :
             'Error Loading Data'}
          </h3>
          <p 
            className="text-xs mb-2"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            {message}
          </p>
          <p 
            className="text-xs"
            style={{ color: sigmatiqTheme.colors.text.muted }}
          >
            {getHelperText()}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: sigmatiqTheme.colors.background.tertiary,
                color: sigmatiqTheme.colors.text.primary,
                border: `1px solid ${sigmatiqTheme.colors.border.default}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.hover;
                e.currentTarget.style.borderColor = sigmatiqTheme.colors.border.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.tertiary;
                e.currentTarget.style.borderColor = sigmatiqTheme.colors.border.default;
              }}
            >
              <RefreshCw className="w-3 h-3" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;