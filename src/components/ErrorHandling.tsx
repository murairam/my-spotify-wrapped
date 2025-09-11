/**
 * Error handling components for the Spotify Wrapped dashboard
 */

import React from 'react';

export interface SpotifyError {
  type: 'network' | 'auth' | 'rate_limit' | 'api' | 'insufficient_data' | 'unknown';
  message: string;
  details?: string;
  suggestions?: string[];
  canRetry: boolean;
}

interface ErrorDisplayProps {
  error: SpotifyError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Comprehensive error display component with user-friendly messages and actionable suggestions
 */
export function ErrorDisplay({ error, onRetry, onDismiss, className = "" }: ErrorDisplayProps) {
  const getErrorIcon = (type: SpotifyError['type']) => {
    switch (type) {
      case 'network':
        return '🌐';
      case 'auth':
        return '🔒';
      case 'rate_limit':
        return '⏱️';
      case 'api':
        return '⚠️';
      case 'insufficient_data':
        return '📊';
      default:
        return '❌';
    }
  };

  const getErrorColor = (type: SpotifyError['type']) => {
    switch (type) {
      case 'network':
        return 'bg-blue-500/20 border-blue-500 text-blue-200';
      case 'auth':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-200';
      case 'rate_limit':
        return 'bg-orange-500/20 border-orange-500 text-orange-200';
      case 'insufficient_data':
        return 'bg-purple-500/20 border-purple-500 text-purple-200';
      default:
        return 'bg-red-500/20 border-red-500 text-red-200';
    }
  };

  return (
    <div className={`${getErrorColor(error.type)} px-4 py-4 sm:px-6 rounded-lg backdrop-blur-sm ${className}`}>
      <div className="flex items-start">
        <span className="text-xl sm:text-2xl mr-2 sm:mr-3 mt-1 flex-shrink-0">
          {getErrorIcon(error.type)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold mb-2 text-sm sm:text-base">
            {error.message}
          </div>

          {error.details && (
            <div className="text-xs sm:text-sm mb-3 opacity-90">
              {error.details}
            </div>
          )}

          {error.suggestions && error.suggestions.length > 0 && (
            <div className="mb-4">
              <div className="text-xs sm:text-sm font-medium mb-2">Try these solutions:</div>
              <ul className="text-xs sm:text-sm space-y-1 ml-4">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="list-disc">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {error.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[36px] touch-manipulation"
              >
                🔄 Try Again
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[36px] touch-manipulation"
            >
              🔃 Refresh Page
            </button>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[36px] touch-manipulation"
              >
                ✕ Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Type guard to check if error has name and message properties
 */
function isErrorWithMessage(error: unknown): error is { name: string; message: string } {
  return typeof error === 'object' && error !== null && 'name' in error && 'message' in error;
}

/**
 * Type guard to check if error has response or status properties
 */
function isHTTPError(error: unknown): error is { response?: { status: number }; status?: number; message?: string } {
  return typeof error === 'object' && error !== null && ('response' in error || 'status' in error);
}

/**
 * Type guard to check if error is an insufficient data error
 */
function isInsufficientDataError(error: unknown): error is { error: string; message?: string; suggestions?: string[] } {
  return typeof error === 'object' && error !== null && 'error' in error;
}

/**
 * Parse different types of errors and convert them to SpotifyError format
 */
export function parseSpotifyError(error: unknown): SpotifyError {
  // Network errors
  if (isErrorWithMessage(error) && error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network Connection Failed',
      details: 'Unable to connect to Spotify services. Please check your internet connection.',
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again'
      ],
      canRetry: true
    };
  }

  // API Response errors
  if (isHTTPError(error)) {
    const status = error.response?.status || error.status;

    switch (status) {
      case 401:
        return {
          type: 'auth',
          message: 'Authentication Required',
          details: 'Your Spotify session has expired. Please sign in again.',
          suggestions: [
            'Sign out and sign back in',
            'Check if you have the required Spotify permissions',
            'Make sure your Spotify account is active'
          ],
          canRetry: false
        };

      case 403:
        return {
          type: 'auth',
          message: 'Access Denied',
          details: 'Insufficient permissions to access your Spotify data.',
          suggestions: [
            'Sign out and sign back in to grant all permissions',
            'Make sure you approve all requested scopes',
            'Check if your Spotify account has restrictions'
          ],
          canRetry: false
        };

      case 429:
        return {
          type: 'rate_limit',
          message: 'Too Many Requests',
          details: 'Spotify API rate limit exceeded. Please wait before trying again.',
          suggestions: [
            'Wait 30-60 seconds before retrying',
            'Try again in a few minutes',
            'Avoid repeatedly clicking the load button'
          ],
          canRetry: true
        };

      case 500:
      case 502:
      case 503:
        return {
          type: 'api',
          message: 'Spotify Service Unavailable',
          details: 'Spotify servers are temporarily unavailable.',
          suggestions: [
            'Try again in a few minutes',
            'Check Spotify status on their website',
            'This is usually temporary'
          ],
          canRetry: true
        };

        default:
        return {
          type: 'api',
          message: `Spotify API Error (${status})`,
          details: error.message || 'An unexpected error occurred while fetching your data.',
          suggestions: [
            'Try refreshing the page',
            'Sign out and sign back in',
            'Contact support if the problem persists'
          ],
          canRetry: true
        };
    }
  }

  // Insufficient data error
  if (isInsufficientDataError(error) && (error.error === 'insufficient_data' || error.message?.includes('insufficient_data'))) {
    return {
      type: 'insufficient_data',
      message: 'Insufficient Spotify Data',
      details: error.message || 'Your Spotify account doesn\'t have enough listening history.',
      suggestions: error.suggestions || [
        'Listen to more music on Spotify',
        'Make sure your listening history is not private',
        'Try again after using Spotify for a few days'
      ],
      canRetry: true
    };
  }

  // Generic errors
  const errorMessage = isErrorWithMessage(error) ? error.message : 'An unexpected error occurred while loading your Spotify data.';
  return {
    type: 'unknown',
    message: 'Something Went Wrong',
    details: errorMessage,
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Sign out and sign back in',
      'Try again in a few minutes'
    ],
    canRetry: true
  };
}/**
 * Inline error component for smaller spaces
 */
export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
      <div className="flex items-center space-x-2">
        <span className="text-red-400">⚠️</span>
        <span className="text-sm">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
