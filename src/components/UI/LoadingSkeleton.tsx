import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <Skeleton className="h-6 w-1/3 mb-4" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

export const SprintOverviewSkeleton: React.FC = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-20" />
    </div>
    <div className="space-y-4">
      <div>
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

export const StandupListSkeleton: React.FC = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-5 w-20" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex items-center space-x-4 mt-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const InsightsSkeleton: React.FC = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-5 w-16" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);