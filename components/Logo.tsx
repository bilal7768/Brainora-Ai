
import React from 'react';

export const BrainLogo: React.FC<{ className?: string, size?: number }> = ({ className = "", size = 40 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2ff" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#b026ff" />
          </linearGradient>
          
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="outer-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Glowing Ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="46" 
          stroke="url(#brain-grad)" 
          strokeWidth="1.5" 
          strokeDasharray="4 2"
          opacity="0.3"
        />
        <circle 
          cx="50" 
          cy="50" 
          r="42" 
          stroke="url(#brain-grad)" 
          strokeWidth="2.5" 
          filter="url(#outer-glow)"
        />

        {/* Stylized Digital Brain Element */}
        <g filter="url(#glow)">
          {/* Main Brain Shape - Left Lobe */}
          <path
            d="M50 30 C35 30 25 40 25 55 C25 65 30 75 40 75 L45 75 C45 75 50 70 50 65"
            fill="url(#brain-grad)"
            fillOpacity="0.15"
            stroke="url(#brain-grad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Main Brain Shape - Right Lobe */}
          <path
            d="M50 30 C65 30 75 40 75 55 C75 65 70 75 60 75 L55 75 C55 75 50 70 50 65"
            fill="url(#brain-grad)"
            fillOpacity="0.15"
            stroke="url(#brain-grad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Circuit Traces Inside Brain */}
          <path d="M35 50 H45 M35 55 H42 M38 60 H45" stroke="white" strokeWidth="1" strokeOpacity="0.6" strokeLinecap="round" />
          <path d="M65 50 H55 M65 55 H58 M62 60 H55" stroke="white" strokeWidth="1" strokeOpacity="0.6" strokeLinecap="round" />
          
          <path d="M50 35 V45" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" />
          
          {/* Central Core Node */}
          <circle cx="50" cy="52" r="4" fill="url(#brain-grad)" filter="url(#outer-glow)">
            <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Atomic / Electron Paths */}
          <ellipse 
            cx="50" cy="52" rx="15" ry="6" 
            stroke="url(#brain-grad)" 
            strokeWidth="0.5" 
            transform="rotate(45 50 52)" 
            opacity="0.5" 
          />
          <ellipse 
            cx="50" cy="52" rx="15" ry="6" 
            stroke="url(#brain-grad)" 
            strokeWidth="0.5" 
            transform="rotate(-45 50 52)" 
            opacity="0.5" 
          />
        </g>

        {/* Peripheral Circuit Nodes */}
        <circle cx="28" cy="45" r="1.5" fill="#00f2ff" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="72" cy="45" r="1.5" fill="#b026ff" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" begin="0.7s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};
