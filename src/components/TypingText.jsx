import React, { useState, useEffect, useRef } from 'react';

const TypingText = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);

    // Clear any existing intervals/timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!text || text.length === 0) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // Start typing animation after a short delay
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < text.length) {
            const nextIndex = prevIndex + 1;
            setDisplayedText(text.substring(0, nextIndex));
            return nextIndex;
          } else {
            clearInterval(intervalRef.current);
            // Small delay before calling onComplete to show cursor one more time
            setTimeout(() => {
              if (onComplete) {
                onComplete();
              }
            }, 300);
            return prevIndex;
          }
        });
      }, speed);
    }, 100); // Small delay before starting to type

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, onComplete]);

  // Show cursor while typing
  const showCursor = currentIndex < text.length;

  return (
    <span className="typing-text">
      {displayedText}
      {showCursor && <span className="typing-cursor">|</span>}
    </span>
  );
};

export default TypingText;

