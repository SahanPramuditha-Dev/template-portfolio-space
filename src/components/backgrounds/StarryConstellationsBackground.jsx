import React, { useEffect, useRef } from 'react';

const StarryConstellationsBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Canvas dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();

    // Star configuration
    const STAR_COUNT = Math.min(Math.floor((width * height) / 10000), 150); // Responsive star count
    const MAX_DISTANCE = 120; // Max distance for drawing constellation lines
    const stars = [];

    // Mouse interaction
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Initialize stars
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseAngle: Math.random() * Math.PI * 2
      });
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw stars
      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i];
        
        // Move star
        star.x += star.vx;
        star.y += star.vy;
        
        // Wrap around edges
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle effect
        star.pulseAngle += star.pulseSpeed;
        const currentAlpha = star.baseAlpha + Math.sin(star.pulseAngle) * 0.3;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, currentAlpha)})`;
        ctx.fill();

        // Check connections with other stars
        for (let j = i + 1; j < STAR_COUNT; j++) {
          const otherStar = stars[j];
          const dx = star.x - otherStar.x;
          const dy = star.y - otherStar.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < MAX_DISTANCE) {
            // Draw line, fading out based on distance
            const opacity = 1 - distance / MAX_DISTANCE;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(otherStar.x, otherStar.y);
            ctx.strokeStyle = `rgba(45, 212, 191, ${opacity * 0.25})`; // cyan-accent tinted lines
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Check connection with mouse
        const mouseDx = star.x - mouse.x;
        const mouseDy = star.y - mouse.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        
        if (mouseDistance < 150) {
          const mouseOpacity = 1 - mouseDistance / 150;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${mouseOpacity * 0.4})`; // light blue for mouse
          ctx.lineWidth = 0.8;
          ctx.stroke();
          
          // Slight attraction to mouse
          star.x -= mouseDx * 0.01;
          star.y -= mouseDy * 0.01;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-primary to-primary">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default StarryConstellationsBackground;
