import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap } from 'lucide-react';

const AIStreamingText = ({ text, isStreaming, onComplete, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const intervalRef = useRef(null);
  const cursorIntervalRef = useRef(null);

  // Cursor blinking effect
  useEffect(() => {
    cursorIntervalRef.current = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Streaming text effect
  useEffect(() => {
    if (!isStreaming || !text) {
      setDisplayedText(text || '');
      setCurrentIndex(text?.length || 0);
      onCompleteRef.current?.();
      return;
    }

    setDisplayedText('');
    setCurrentIndex(0);

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex >= text.length) {
          clearInterval(intervalRef.current);
          onCompleteRef.current?.();
          return prevIndex;
        }
        const nextIndex = prevIndex + 1;
        setDisplayedText(text.substring(0, nextIndex));
        return nextIndex;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, isStreaming, speed]);

  const isComplete = currentIndex >= (text?.length || 0);

  return (
    <div className="relative">
      <div className="whitespace-pre-wrap leading-relaxed">
        {displayedText}
        {isStreaming && !isComplete && (
          <motion.span
            animate={{ opacity: showCursor ? 1 : 0 }}
            className="inline-block w-0.5 h-4 bg-primary ml-0.5"
          />
        )}
      </div>
    </div>
  );
};

const AIThinkingIndicator = ({ visible, stage = 'analyzing' }) => {
  const stages = {
    analyzing: { text: 'Analyzing code structure...', icon: Brain },
    processing: { text: 'Processing with AI models...', icon: Zap },
    generating: { text: 'Generating recommendations...', icon: Brain },
    finalizing: { text: 'Finalizing results...', icon: Zap }
  };

  const { text, icon: Icon } = stages[stage] || stages.analyzing;

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="flex-shrink-0"
      >
        <Icon className="w-5 h-5 text-primary" />
      </motion.div>
      
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{text}</p>
        <div className="flex gap-1 mt-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-primary/60 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const StreamingLoadingSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-muted/50 rounded w-32"></div>
        <div className="h-4 bg-muted/50 rounded w-16"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-2">
        <div className="h-3 bg-muted/50 rounded w-full"></div>
        <div className="h-3 bg-muted/50 rounded w-4/5"></div>
        <div className="h-3 bg-muted/50 rounded w-3/4"></div>
      </div>
      
      {/* Code block skeleton */}
      <div className="p-3 bg-muted/20 rounded-xl space-y-2">
        <div className="h-2 bg-muted/50 rounded w-full"></div>
        <div className="h-2 bg-muted/50 rounded w-5/6"></div>
        <div className="h-2 bg-muted/50 rounded w-4/5"></div>
        <div className="h-2 bg-muted/50 rounded w-full"></div>
      </div>
      
      {/* Shimmer effect */}
      <div className="relative overflow-hidden">
        <motion.div
          animate={{ x: [-100, 400] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{ width: '100px' }}
        />
      </div>
    </div>
  );
};

export { AIStreamingText, AIThinkingIndicator, StreamingLoadingSkeleton };