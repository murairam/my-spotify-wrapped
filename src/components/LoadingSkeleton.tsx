/**
 * Loading skeleton components for various sections of the Spotify Wrapped dashboard
 */

import React from 'react';

/**
 * Skeleton for individual track/artist items
 */
export function ItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg bg-white/5 animate-pulse">
      {/* Rank circle */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex-shrink-0"></div>

      {/* Album/Artist image */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-600 rounded flex-shrink-0"></div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* Popularity bar */}
      <div className="w-20 sm:w-24">
        <div className="h-2 bg-gray-600 rounded w-full"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton for stats cards
 */
export function StatCardSkeleton() {
  return (
    <div className="p-3 sm:p-4 bg-white/5 rounded-xl animate-pulse">
      <div className="space-y-2">
        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
        <div className="h-6 bg-gray-600 rounded w-1/3"></div>
        <div className="h-2 bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton for genre tags
 */
export function GenreTagSkeleton() {
  return (
    <div className="px-3 sm:px-4 py-2 bg-gray-600 rounded-full animate-pulse">
      <div className="h-3 w-16 bg-gray-500 rounded"></div>
    </div>
  );
}

/**
 * Main dashboard loading component
 */
export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* User Profile Skeleton */}
      <div className="bg-gradient-to-r from-gray-800/20 to-gray-700/20 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-gray-600/30 shadow-xl animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-full flex-shrink-0"></div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 bg-gray-600 rounded w-32"></div>
              <div className="h-3 bg-gray-700 rounded w-48"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-600 rounded w-16"></div>
            <div className="h-2 bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Top Tracks and Artists Grid */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Top Tracks Skeleton */}
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-gray-600 rounded mr-2 sm:mr-3"></div>
            <div className="h-6 bg-gray-600 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <ItemSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Top Artists Skeleton */}
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-gray-600 rounded mr-2 sm:mr-3"></div>
            <div className="h-6 bg-gray-600 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <ItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Genres and Stats Grid */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Genres Skeleton */}
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-gray-600 rounded mr-2 sm:mr-3"></div>
            <div className="h-6 bg-gray-600 rounded w-24"></div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[...Array(8)].map((_, i) => (
              <GenreTagSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/20 shadow-xl">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-gray-600 rounded mr-2 sm:mr-3"></div>
            <div className="h-6 bg-gray-600 rounded w-24"></div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Loading message */}
      <div className="text-center py-8">
        {/* Fixed contrast for accessibility (Spotify guideline compliance) */}
        <div className="inline-flex items-center space-x-2 text-gray-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1DB954]"></div>
          <span className="text-sm">Loading your Spotify data...</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini loading spinner for buttons
 */
export function ButtonLoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      <span>Loading...</span>
    </div>
  );
}
