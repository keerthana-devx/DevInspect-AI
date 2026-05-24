import React from 'react';
import { motion } from 'framer-motion';

// Hover glow effect wrapper
export const GlowHover = ({ children, className = '', glowColor = 'primary' }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        boxShadow: `0 0 20px var(--${glowColor})`,
        scale: 1.02
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Smooth loading skeleton with shimmer
export const ShimmerSkeleton = ({ className = '', width = '100%', height = '1rem' }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-muted/50 rounded ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: [-100, 300] }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{ width: '100px' }}
      />
    </div>
  );
};

// Animated success checkmark
export const SuccessCheckmark = ({ visible, size = 24 }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      className="flex items-center justify-center"
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="text-green-500"
      >
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
      </motion.svg>
    </motion.div>
  );
};

// Floating pulse animation
export const FloatingPulse = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -4, 0],
        scale: [1, 1.02, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// Smooth expand/collapse animation
export const SmoothCollapse = ({ isOpen, children, className = '' }) => {
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={false}
      animate={{
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
    >
      <div className="p-1">
        {children}
      </div>
    </motion.div>
  );
};

// Staggered list animation
export const StaggeredList = ({ children, className = '', delay = 0.1 }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Smooth toast notification
export const SmoothToast = ({ message, type = 'info', visible, onClose }) => {
  const colors = {
    success: 'bg-green-500/10 border-green-500/20 text-green-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl border backdrop-blur-sm ${colors[type]}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Animated progress bar
export const AnimatedProgress = ({ value, className = '', showLabel = false }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute right-0 top-3 text-xs text-muted-foreground"
        >
          {value}%
        </motion.span>
      )}
    </div>
  );
};

// Ripple effect button
export const RippleButton = ({ children, onClick, className = '', ...props }) => {
  const [ripples, setRipples] = React.useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/20 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </button>
  );
};