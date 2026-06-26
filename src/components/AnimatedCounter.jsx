import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';

export default function AnimatedCounter({ value, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Extract the numeric part and non-numeric prefix if any
  const numericString = value.replace(/[^0-9.]/g, '');
  const parsedValue = parseFloat(numericString);
  const isNumeric = !isNaN(parsedValue);

  const prefixMatch = value.match(/^[^0-9.]+/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const valueSuffixMatch = value.match(/[^0-9.]+$/);
  const valueSuffix = valueSuffixMatch ? valueSuffixMatch[0] : '';

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    Number.isInteger(parsedValue) ? Math.round(latest) : latest.toFixed(1)
  );

  useEffect(() => {
    if (isInView && isNumeric) {
      const controls = animate(count, parsedValue, {
        duration: 2,
        ease: 'easeOut',
      });
      return controls.stop;
    }
  }, [isInView, isNumeric, parsedValue, count]);

  if (!isNumeric) {
    return (
      <p className="text-4xl font-black text-accent">
        {value}
        {suffix ? ` ${suffix}` : ''}
      </p>
    );
  }

  return (
    <div ref={ref} className="text-4xl font-black text-accent flex items-center justify-center font-sans tracking-tighter">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {valueSuffix}
      {suffix ? ` ${suffix}` : ''}
    </div>
  );
}
