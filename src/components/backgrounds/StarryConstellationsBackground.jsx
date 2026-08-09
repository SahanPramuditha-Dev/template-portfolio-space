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
    const STAR_COUNT = Math.min(Math.floor((width * height) / 12000), 110);
    const MAX_DISTANCE = 110;
    const MAX_DIST_SQ = MAX_DISTANCE * MAX_DISTANCE;
    const GRID_SIZE = MAX_DISTANCE;
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
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Track scroll activity to throttle line calculations during fast scrolling
    let isScrollingFast = false;
    let scrollTimeout = null;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      if (delta > 15) {
        isScrollingFast = true;
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrollingFast = false;
        }, 150);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize stars
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.4 + 0.6,
        baseAlpha: Math.random() * 0.4 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseAngle: Math.random() * Math.PI * 2
      });
    }

    // Animation Loop
    const animate = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      
      // 1. Move stars & build spatial grid
      const grid = new Map();

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i];
        
        star.x += star.vx;
        star.y += star.vy;
        
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        star.pulseAngle += star.pulseSpeed;

        const cellX = Math.floor(star.x / GRID_SIZE);
        const cellY = Math.floor(star.y / GRID_SIZE);
        const key = `${cellX},${cellY}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(star);
      }

      // 2. Draw stars in a single batched pass
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i];
        ctx.moveTo(star.x + star.radius, star.y);
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      }
      ctx.fill();

      // 3. Draw constellation lines in a single batched pass (skip if scrolling fast)
      if (!isScrollingFast) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.18)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < STAR_COUNT; i++) {
          const star = stars[i];
          const cellX = Math.floor(star.x / GRID_SIZE);
          const cellY = Math.floor(star.y / GRID_SIZE);

          // Check cell and neighboring cells (right and down to avoid double check)
          const neighborOffsets = [
            [0, 0], [1, 0], [0, 1], [1, 1], [-1, 1]
          ];

          for (let k = 0; k < neighborOffsets.length; k++) {
            const [ox, oy] = neighborOffsets[k];
            const cellStars = grid.get(`${cellX + ox},${cellY + oy}`);
            if (!cellStars) continue;

            for (let j = 0; j < cellStars.length; j++) {
              const other = cellStars[j];
              if (other.id <= star.id) continue; // Avoid duplicate pairs

              const dx = star.x - other.x;
              const dy = star.y - other.y;
              const distSq = dx * dx + dy * dy;

              if (distSq < MAX_DIST_SQ) {
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(other.x, other.y);
              }
            }
          }

          // Mouse attraction & connection
          if (mouse.x > 0) {
            const mdx = star.x - mouse.x;
            const mdy = star.y - mouse.y;
            const mdistSq = mdx * mdx + mdy * mdy;
            if (mdistSq < 150 * 150) {
              ctx.moveTo(star.x, star.y);
              ctx.lineTo(mouse.x, mouse.y);
              star.x -= mdx * 0.008;
              star.y -= mdy * 0.008;
            }
          }
        }
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
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
