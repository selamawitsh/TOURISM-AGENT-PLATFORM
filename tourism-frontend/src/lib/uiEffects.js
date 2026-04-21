import { useEffect } from 'react';

export function useReveal(selector = '[data-reveal]') {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const elems = Array.from(document.querySelectorAll(selector));
    if (!elems.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elems.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-6', 'transition-all', 'duration-700', 'will-change-transform');
      io.observe(el);
    });

    return () => io.disconnect();
  }, [selector]);
}

export function useParallax(ref, factor = 0.2) {
  useEffect(() => {
    if (!ref?.current) return undefined;

    const el = ref.current;
    const handle = () => {
      const rect = el.getBoundingClientRect();
      const offset = window.scrollY || window.pageYOffset;
      const y = (rect.top + offset) * factor * -1;
      el.style.transform = `translate3d(0,${y}px,0)`;
    };

    handle();
    window.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
      if (el) el.style.transform = '';
    };
  }, [ref, factor]);
}

export function useHorizontalDrag(ref) {
  useEffect(() => {
    const el = ref?.current;
    if (!el) return undefined;

    let isDown = false;
    let startX, scrollLeft, vel = 0, rafId;

    const onDown = (e) => {
      isDown = true;
      el.classList.add('cursor-grabbing');
      startX = e.pageX ?? e.touches?.[0]?.pageX;
      scrollLeft = el.scrollLeft;
      vel = 0;
      cancelAnimationFrame(rafId);
    };

    const onMove = (e) => {
      if (!isDown) return;
      const x = e.pageX ?? e.touches?.[0]?.pageX;
      const walk = (startX - x);
      const prev = el.scrollLeft;
      el.scrollLeft = scrollLeft + walk;
      vel = el.scrollLeft - prev;
    };

    const onUp = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
      const decelerate = () => {
        if (Math.abs(vel) < 0.5) return;
        el.scrollLeft += vel;
        vel *= 0.95;
        rafId = requestAnimationFrame(decelerate);
      };
      rafId = requestAnimationFrame(decelerate);
    };

    el.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);

    // Nice wheel horizontal scroll support
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > 0) return; // let native
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(rafId);
    };
  }, [ref]);
}
