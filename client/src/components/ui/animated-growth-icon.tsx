import React, { useEffect, useRef } from "react";

export function AnimatedGrowthIcon({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Animate nodes
    const nodes = svgRef.current.querySelectorAll('.node');
    nodes.forEach((node, index) => {
      node.animate(
        [
          { opacity: 0.2, transform: 'scale(0.8)' },
          { opacity: 1, transform: 'scale(1.05)' },
          { opacity: 0.8, transform: 'scale(1)' }
        ], 
        { 
          duration: 3000, 
          delay: index * 200,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'ease-in-out'
        }
      );
    });

    // Animate connections
    const connections = svgRef.current.querySelectorAll('.connection');
    connections.forEach((connection, index) => {
      connection.animate(
        [
          { opacity: 0.2, strokeDashoffset: '20' },
          { opacity: 0.8, strokeDashoffset: '0' }
        ], 
        { 
          duration: 2500, 
          delay: 100 + index * 300,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'ease-in-out'
        }
      );
    });
  }, []);

  return (
    <svg 
      ref={svgRef}
      width="120" 
      height="120" 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g className="network">
        {/* Base circle */}
        <circle cx="60" cy="90" r="8" className="node" fill="url(#nodeGradient)" />
        
        {/* Connection to middle left node */}
        <path 
          d="M57 83L47 63" 
          className="connection" 
          stroke="url(#connectionGradient)" 
          strokeWidth="2"
          strokeDasharray="20"
          strokeLinecap="round"
        />
        
        {/* Middle left node */}
        <circle cx="45" cy="60" r="6" className="node" fill="url(#nodeGradient)" />
        
        {/* Connection to middle right node */}
        <path 
          d="M63 83L73 63" 
          className="connection" 
          stroke="url(#connectionGradient)" 
          strokeWidth="2"
          strokeDasharray="20"
          strokeLinecap="round"
        />
        
        {/* Middle right node */}
        <circle cx="75" cy="60" r="6" className="node" fill="url(#nodeGradient)" />
        
        {/* Connection from middle left to top left */}
        <path 
          d="M43 54L38 34" 
          className="connection" 
          stroke="url(#connectionGradient)" 
          strokeWidth="2"
          strokeDasharray="20"
          strokeLinecap="round"
        />
        
        {/* Top left node */}
        <circle cx="35" cy="30" r="5" className="node" fill="url(#nodeGradient)" />
        
        {/* Connection from middle left to top middle */}
        <path 
          d="M49 55L58 35" 
          className="connection" 
          stroke="url(#connectionGradient)" 
          strokeWidth="2"
          strokeDasharray="20"
          strokeLinecap="round"
        />
        
        {/* Top middle node */}
        <circle cx="60" cy="30" r="7" className="node" fill="url(#nodeGradient)" />
        
        {/* Connection from middle right to top right */}
        <path 
          d="M77 54L82 34" 
          className="connection" 
          stroke="url(#connectionGradient)" 
          strokeWidth="2"
          strokeDasharray="20"
          strokeLinecap="round"
        />
        
        {/* Top right node */}
        <circle cx="85" cy="30" r="5" className="node" fill="url(#nodeGradient)" />
      </g>
      
      <defs>
        <linearGradient id="nodeGradient" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        
        <linearGradient id="connectionGradient" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}