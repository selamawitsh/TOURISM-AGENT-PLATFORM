import React, { useEffect, useRef, useState } from 'react';

// Lightweight LazyLoad component: renders children only when scrolled into view.
const LazyLoad = ({ children, className, rootMargin = '200px' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { root: null, rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref} className={className}>{visible ? children : null}</div>;
};

export default LazyLoad;
