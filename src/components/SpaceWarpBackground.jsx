import React, { useEffect, useRef } from 'react';

const SpaceWarpBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const numStars = 180;
    const stars = [];

    // Initialize stars with 3D coordinates (x, y, z)
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        color: Math.random() > 0.4 ? '#38bdf8' : '#60a5fa', // Multi-shade blue/cyan accents
        speedModifier: 0.5 + Math.random() * 1.5,
      });
    }

    let speed = 2.0;
    let targetSpeed = 2.0;
    let cx = width / 2;
    let cy = height / 2;
    let targetCx = width / 2;
    let targetCy = height / 2;

    const animate = () => {
      // Clear with absolute transparency so background glows shine through
      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate speed and warp center
      speed += (targetSpeed - speed) * 0.05;
      cx += (targetCx - cx) * 0.05;
      cy += (targetCy - cy) * 0.05;

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];

        // Move closer (decrease depth)
        star.z -= speed * star.speedModifier;

        // Reset if star goes past the screen depth
        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = width;
        }

        // 3D perspective projection
        const k = 128.0 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = (1 - star.z / width) * 2;
          
          // Calculate previous position to draw a streak
          const prevK = 128.0 / (star.z + speed * 1.5 * star.speedModifier);
          const prevX = star.x * prevK + cx;
          const prevY = star.y * prevK + cy;

          // Draw the warp streak
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(prevX, prevY);
          
          // Fade star out as it gets very far away (z increases)
          const alpha = 1 - star.z / width;
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = size;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0; // Reset alpha for next frame

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      targetCx = width / 2;
      targetCy = height / 2;
    };

    const handleMouseMove = (e) => {
      // Shift warp center relative to mouse position
      const relX = (e.clientX - width / 2) / (width / 2);
      const relY = (e.clientY - height / 2) / (height / 2);
      targetCx = width / 2 + relX * 80;
      targetCy = height / 2 + relY * 80;
    };

    const handleMouseDown = () => {
      targetSpeed = 12.0; // Accelerate warp speed on mouse click
    };

    const handleMouseUp = () => {
      targetSpeed = 2.0; // Return to normal warp speed
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-transparent"
    />
  );
};

export default SpaceWarpBackground;
