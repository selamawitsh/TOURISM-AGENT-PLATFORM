import React from 'react';

const CardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-[#e8d5b7] bg-white p-4">
    <div className="h-48 rounded-lg bg-gray-200" />
    <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
    <div className="mt-2 flex gap-2">
      <div className="h-3 w-16 rounded bg-gray-200" />
      <div className="h-3 w-10 rounded bg-gray-200" />
    </div>
  </div>
);

const SkeletonLoader = ({ count = 6, gridClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }) => (
  <div className={`grid gap-6 ${gridClass}`}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export default SkeletonLoader;
