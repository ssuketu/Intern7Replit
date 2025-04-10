import React from "react";

export function AptitudeCipherIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="fingerprint-to-gear">
        {/* Fingerprint layers */}
        <path
          d="M40 20C31.716 20 25 26.716 25 35C25 43.284 31.716 50 40 50C48.284 50 55 43.284 55 35C55 26.716 48.284 20 40 20Z"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M40 25C34.477 25 30 29.477 30 35C30 40.523 34.477 45 40 45C45.523 45 50 40.523 50 35C50 29.477 45.523 25 40 25Z"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M40 30C37.239 30 35 32.239 35 35C35 37.761 37.239 40 40 40C42.761 40 45 37.761 45 35C45 32.239 42.761 30 40 30Z"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        
        {/* Gear elements */}
        <path
          d="M40 15V18"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M40 52V55"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M25 35H22"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M58 35H55"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M29 24L27 22"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M53 48L51 46"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M29 46L27 48"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M53 22L51 24"
          stroke="url(#aptitudeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <linearGradient id="aptitudeGradient" x1="20" y1="15" x2="60" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ProficiencyNexusIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="overlapping-circles">
        {/* First circle, slightly misaligned */}
        <circle
          cx="35"
          cy="40"
          r="20"
          stroke="url(#proficiencyGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        
        {/* Second circle, gradually harmonizing */}
        <circle
          cx="45"
          cy="40"
          r="20"
          stroke="url(#proficiencyGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        />
        
        {/* Connector lines */}
        <path
          d="M40 20C37 28 37 52 40 60"
          stroke="url(#proficiencyGradient)"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        
        <path
          d="M20 40C28 37 52 37 60 40"
          stroke="url(#proficiencyGradient)"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        
        {/* Central harmonized point */}
        <circle
          cx="40"
          cy="40"
          r="4"
          fill="url(#proficiencyGradient)"
        />
      </g>
      <defs>
        <linearGradient id="proficiencyGradient" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function EncounterLensIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="focused-beam">
        {/* Beam source */}
        <circle
          cx="20"
          cy="40"
          r="6"
          fill="url(#encounterGradient)"
        />
        
        {/* Beam path */}
        <path
          d="M26 40H45"
          stroke="url(#encounterGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
        
        {/* Light cone */}
        <path
          d="M45 40L60 30V50L45 40Z"
          fill="url(#encounterGradient)"
          opacity="0.5"
        />
        
        {/* Person silhouette */}
        <path
          d="M50 40C50 37 52 32 55 32C58 32 60 37 60 40"
          stroke="url(#encounterGradient)"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="55"
          cy="28"
          r="4"
          stroke="url(#encounterGradient)"
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Lens elements */}
        <circle
          cx="40"
          cy="40"
          r="25"
          stroke="url(#encounterGradient)"
          strokeWidth="1"
          strokeDasharray="2 3"
          fill="none"
        />
        
        <path
          d="M40 15V20"
          stroke="url(#encounterGradient)"
          strokeWidth="1"
        />
        <path
          d="M40 60V65"
          stroke="url(#encounterGradient)"
          strokeWidth="1"
        />
        <path
          d="M15 40H20"
          stroke="url(#encounterGradient)"
          strokeWidth="1"
        />
        <path
          d="M60 40H65"
          stroke="url(#encounterGradient)"
          strokeWidth="1"
        />
      </g>
      <defs>
        <linearGradient id="encounterGradient" x1="15" y1="25" x2="65" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GrowthTrajectoryIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="growth-trajectory">
        {/* Timeline base */}
        <path
          d="M15 60H65"
          stroke="url(#growthGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Timeline markers */}
        <circle cx="25" cy="60" r="2" fill="url(#growthGradient)" />
        <circle cx="40" cy="60" r="2" fill="url(#growthGradient)" />
        <circle cx="55" cy="60" r="2" fill="url(#growthGradient)" />
        
        {/* Seed and roots */}
        <circle cx="40" cy="55" r="3" fill="url(#growthGradient)" />
        <path
          d="M38 55C38 58 39 60 40 60"
          stroke="url(#growthGradient)"
          strokeWidth="1"
        />
        <path
          d="M42 55C42 58 41 60 40 60"
          stroke="url(#growthGradient)"
          strokeWidth="1"
        />
        
        {/* Plant growth - stem */}
        <path
          d="M40 55V35"
          stroke="url(#growthGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Branches */}
        <path
          d="M40 45H50"
          stroke="url(#growthGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M40 40H30"
          stroke="url(#growthGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M40 35H45"
          stroke="url(#growthGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Leaves/flower */}
        <circle cx="50" cy="45" r="3" fill="url(#growthGradient)" opacity="0.8" />
        <circle cx="30" cy="40" r="3" fill="url(#growthGradient)" opacity="0.8" />
        <circle cx="45" cy="35" r="3" fill="url(#growthGradient)" opacity="0.8" />
        
        {/* Top flourish */}
        <circle cx="40" cy="30" r="4" fill="url(#growthGradient)" />
        <path
          d="M36 26L44 34"
          stroke="url(#growthGradient)"
          strokeWidth="1"
        />
        <path
          d="M44 26L36 34"
          stroke="url(#growthGradient)"
          strokeWidth="1"
        />
      </g>
      <defs>
        <linearGradient id="growthGradient" x1="15" y1="25" x2="65" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}