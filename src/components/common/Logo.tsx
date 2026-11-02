import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 48, showText = false }) => {
  return (
    <div className={`flex items-center gap-1 select-none ${className}`}>
      <img
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="shrink-0 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      />
      {showText && (
        <span className="font-extrabold text-xl tracking-tight text-chrome-neutral-100">
          Aello
        </span>
      )}
    </div>
  );
};

export default Logo;
