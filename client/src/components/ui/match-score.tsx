import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MatchScore({ score, size = "md", className }: MatchScoreProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const sizeValues = {
    sm: {
      width: 12,
      height: 12,
      radius: 5,
      strokeWidth: 1,
      fontSize: "text-xs",
    },
    md: {
      width: 16,
      height: 16,
      radius: 7,
      strokeWidth: 2,
      fontSize: "text-lg",
    },
    lg: {
      width: 20,
      height: 20,
      radius: 9,
      strokeWidth: 2,
      fontSize: "text-xl",
    },
  };
  
  const { width, height, radius, strokeWidth, fontSize } = sizeValues[size];
  
  useEffect(() => {
    if (circleRef.current) {
      const circle = circleRef.current;
      const circumference = 2 * Math.PI * radius;
      
      circle.style.strokeDasharray = `${circumference}`;
      
      // Wait for animation
      setTimeout(() => {
        setIsVisible(true);
        const offset = circumference - (score / 100) * circumference;
        circle.style.strokeDashoffset = `${offset}`;
      }, 100);
    }
  }, [radius, score]);
  
  return (
    <div className={cn("relative", className)}>
      <svg className="w-full h-full" viewBox={`0 0 ${width * 2} ${height * 2}`}>
        <circle
          cx={width}
          cy={height}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        <circle
          ref={circleRef}
          cx={width}
          cy={height}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={`text-primary-500 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
            strokeDashoffset: "100",
          }}
        />
        <text
          x={width}
          y={height}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`${fontSize} font-bold text-gray-900 select-none ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transition: "opacity 500ms ease-out" }}
        >
          {score}%
        </text>
      </svg>
    </div>
  );
}
