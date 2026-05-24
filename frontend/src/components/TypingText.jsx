import React, { useEffect, useState, useRef } from 'react';

/**
 * Renders text with a smooth typing animation.
 * @param {string} text - The full text to animate
 * @param {number} speed - Characters per interval (default 3)
 * @param {boolean} active - Whether animation is active
 */
const TypingText = ({ text = '', speed = 4, active = true, className = '' }) => {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active || !text) {
      setDisplayed(text || '');
      return;
    }
    // Reset
    indexRef.current = 0;
    setDisplayed('');

    timerRef.current = setInterval(() => {
      indexRef.current += speed;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        clearInterval(timerRef.current);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, 16); // ~60fps

    return () => clearInterval(timerRef.current);
  }, [text, active]);

  const isDone = displayed.length >= (text?.length || 0);

  return (
    <span className={className}>
      {displayed}
      {!isDone && active && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
};

export default TypingText;
