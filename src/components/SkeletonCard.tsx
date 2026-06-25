/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function SkeletonOfferCard() {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden p-6 animate-pulse">
      <div className="h-48 bg-surface-container/50 rounded-xl mb-4" />
      <div className="h-4 bg-surface-container/50 rounded mb-3 w-3/4" />
      <div className="h-4 bg-surface-container/50 rounded mb-4 w-1/2" />
      <div className="h-10 bg-surface-container/50 rounded-lg" />
    </div>
  );
}

export function SkeletonCategoryCard() {
  return (
    <div className="rounded-2xl p-4 bg-white border border-outline-variant/10 animate-pulse">
      <div className="w-12 h-12 bg-surface-container/50 rounded-lg mb-3" />
      <div className="h-4 bg-surface-container/50 rounded w-3/4" />
    </div>
  );
}

export function SkeletonFeaturedOffer() {
  return (
    <div className="bg-white rounded-3xl border border-outline-variant/15 p-4 md:p-5 animate-pulse">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
        <div className="h-44 sm:h-32 sm:w-52 rounded-2xl bg-surface-container/50 shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-6 bg-surface-container/50 rounded w-2/3" />
          <div className="h-4 bg-surface-container/50 rounded w-full" />
          <div className="h-4 bg-surface-container/50 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
