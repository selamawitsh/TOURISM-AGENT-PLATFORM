import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const FeatureGuard = ({ features = [], children, featuresData }) => {
  const ready = features.every((f) => {
    const v = featuresData?.[f];
    return v !== undefined && v !== null;
  });
  
  if (ready) return children;
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl p-6">
        <SkeletonLoader count={3} />
      </div>
    </div>
  );
};

export default FeatureGuard;