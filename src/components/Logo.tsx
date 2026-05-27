import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  variant?: "full" | "icon";
  className?: string;
}

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="domGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {/* Background rounded square */}
      <rect width="48" height="48" rx="12" fill="url(#domGrad)" />
      {/* Stylized "D" with spine/body arc */}
      <path
        d="M13 10 L13 38 L22 38 C30.837 38 38 30.837 38 24 C38 17.163 30.837 10 22 10 L13 10Z"
        fill="white"
        opacity="0.15"
      />
      <path
        d="M14 12 L14 36 L22 36 C29.732 36 36 30.627 36 24 C36 17.373 29.732 12 22 12 L14 12Z"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Pulse/movement line inside D */}
      <path
        d="M19 24 L22 19 L25 27 L28 22 L31 24"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Logo({ size = 36, showText = true, variant = "full", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />
      {showText && variant === "full" && (
        <div>
          <span
            className="font-black tracking-tight leading-none"
            style={{
              fontSize: size * 0.5,
              background: "linear-gradient(135deg, #0ea5e9, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Dom
          </span>
          <span
            className="font-black tracking-tight leading-none"
            style={{ fontSize: size * 0.5, color: "white" }}
          >
            Fisio
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoDark({ size = 36, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon size={size} />
      {showText && (
        <div className="leading-none">
          <span
            className="font-black tracking-tight"
            style={{
              fontSize: size * 0.5,
              background: "linear-gradient(135deg, #0ea5e9, #10b981)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Dom
          </span>
          <span className="font-black tracking-tight" style={{ fontSize: size * 0.5, color: "#0f172a" }}>
            Fisio
          </span>
        </div>
      )}
    </div>
  );
}
