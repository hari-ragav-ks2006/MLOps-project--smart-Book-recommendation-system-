import React, { useState, useRef, useCallback } from 'react';

/**
 * TiltCard3D — High-performance 3D Physics Perspective Card
 * Adds realistic tilt angle, 3D layer popout, and specular glare reflection.
 */
export default function TiltCard3D({
  children,
  className = '',
  maxTilt = 14,
  scale = 1.03,
  glare = true,
  onClick,
  style = {}
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Normalize -1 to 1
    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setCoords({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      rotateX,
      rotateY,
      active: true
    });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setCoords(c => ({ ...c, rotateX: 0, rotateY: 0, active: false }));
  }, []);

  const transformStyle = coords.active
    ? `perspective(1000px) rotateX(${coords.rotateX.toFixed(2)}deg) rotateY(${coords.rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{
        transform: transformStyle,
        transformStyle: 'preserve-3d',
        ...style
      }}
    >
      {children}

      {/* Dynamic Specular Glare */}
      {glare && coords.active && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle 280px at ${coords.x}% ${coords.y}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 40%, transparent 80%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
}
