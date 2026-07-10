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

export function SkeletonHero() {
  return (
    <div className="w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mt-8">
      <div className="relative w-full h-[460px] md:h-[540px] rounded-4xl md:rounded-[48px] overflow-hidden bg-surface-container animate-pulse">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-surface-container via-surface-high to-surface-container bg-size-[200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite]" />
        {/* Ghost text block */}
        <div className="absolute inset-0 flex items-center px-8 md:px-20">
          <div className="max-w-xl space-y-5">
            <div className="h-3 w-32 rounded-full bg-surface-highest" />
            <div className="space-y-3">
              <div className="h-10 md:h-16 w-72 md:w-96 rounded-xl bg-surface-highest" />
              <div className="h-10 md:h-16 w-56 md:w-72 rounded-xl bg-surface-highest" />
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-3 w-64 rounded-full bg-surface-highest" />
              <div className="h-3 w-48 rounded-full bg-surface-highest" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-40 rounded-full bg-surface-highest" />
              <div className="h-11 w-28 rounded-full bg-surface-highest" />
            </div>
          </div>
        </div>
      </div>
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
