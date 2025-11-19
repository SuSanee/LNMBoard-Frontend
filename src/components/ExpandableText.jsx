import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const getCollapsedStyles = (lines) => ({
  display: '-webkit-box',
  WebkitLineClamp: String(lines),
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const ExpandableText = ({ text = '', lines = 2, className = '', moreLabel = 'see more', lessLabel = 'show less' }) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    setExpanded(false);
  }, [text, lines]);

  useEffect(() => {
    if (expanded) return;
    const el = textRef.current;
    if (!el) return;

    const computeTruncation = () => {
      const overflow = el.scrollHeight > el.clientHeight + 1;
      setIsTruncated(overflow);
    };

    const raf = requestAnimationFrame(computeTruncation);

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (!expanded) {
          computeTruncation();
        }
      });
      observer.observe(el);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [expanded, text, lines]);

  if (!text) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <p
        ref={textRef}
        className={cn('text-sm text-gray-700', className)}
        style={expanded ? undefined : getCollapsedStyles(lines)}
      >
        {text}
      </p>
      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-sm font-semibold text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;

