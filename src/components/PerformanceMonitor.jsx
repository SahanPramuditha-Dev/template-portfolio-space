import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * PerformanceMonitor
 * Measures the rendering frame time in React Three Fiber.
 * If the average frame rate falls below 40 FPS, it triggers the onLowPerformance callback.
 */
const PerformanceMonitor = ({ onLowPerformance }) => {
  const frameTimes = useRef([]);
  const triggered = useRef(false);

  useFrame((state, delta) => {
    if (triggered.current) return;

    // Wait at least 3 seconds for scenes to load/compile before monitoring
    if (state.clock.getElapsedTime() < 3.0) return;

    frameTimes.current.push(delta);

    // Monitor over a rolling window of 60 frames
    if (frameTimes.current.length > 60) {
      frameTimes.current.shift();

      const avgDelta = frameTimes.current.reduce((sum, val) => sum + val, 0) / frameTimes.current.length;
      const fps = 1.0 / avgDelta;

      // Trigger degradation if FPS drops below 40
      if (fps < 40.0) {
        triggered.current = true;
        if (typeof onLowPerformance === 'function') {
          onLowPerformance();
        }
      }
    }
  });

  return null;
};

export default PerformanceMonitor;
