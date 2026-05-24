import React, { memo } from 'react';
import { motion } from 'framer-motion';

// Reusable bone element — defined BEFORE use
const Bone = ({ className = '' }) => (
  <div className={`bg-muted/40 rounded-lg animate-pulse ${className}`} />
);

/**
 * LoadingSkeleton — glassmorphism skeleton for result panel while loading
 */
const LoadingSkeleton = memo(() => (
  <div className="card-glass p-6 rounded-3xl space-y-4 min-h-[520px]">
    {/* Header skeleton */}
    <div className="flex justify-between items-center pb-3 border-b border-border/20">
      <div className="space-y-2">
        <Bone className="h-5 w-36" />
        <Bone className="h-3 w-24" />
      </div>
      <div className="flex gap-2">
        <Bone className="h-9 w-9 rounded-xl" />
        <Bone className="h-9 w-16 rounded-xl" />
      </div>
    </div>

    {/* Tab skeleton */}
    <div className="flex gap-2">
      <Bone className="h-8 flex-1 rounded-lg" />
      <Bone className="h-8 flex-1 rounded-lg" />
      <Bone className="h-8 flex-1 rounded-lg" />
    </div>

    {/* Content skeleton */}
    <div className="space-y-3">
      <Bone className="h-32 w-full rounded-xl" />
      <Bone className="h-4 w-3/4" />
      <Bone className="h-4 w-1/2" />
      <Bone className="h-4 w-5/6" />
    </div>

    {/* Findings skeleton */}
    <div className="space-y-2 pt-2">
      <Bone className="h-3 w-20" />
      {[1, 2, 3].map(i => (
        <Bone key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>

    {/* AI thinking indicator */}
    <div className="flex items-center gap-3 pt-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-primary" />
        ))}
      </div>
      <span className="text-xs text-muted-foreground animate-pulse">AI is thinking...</span>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';
export default LoadingSkeleton;
