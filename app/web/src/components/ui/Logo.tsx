import React from "react";

export function PlaceMeLogoIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <img
      src="/applogo.png"
      alt="PlaceMe Logo"
      className={`object-contain rounded-lg ${className}`}
    />
  );
}

export function PlaceMeBrand({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-base font-bold",
    md: "text-lg font-bold",
    lg: "text-2xl font-black",
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="shrink-0 transition-transform duration-200 hover:scale-105">
        <PlaceMeLogoIcon className={iconSizes[size]} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} tracking-tight text-foreground font-sans`}>
          Place<span className="text-primary">Me</span>
        </span>
      )}
    </div>
  );
}
