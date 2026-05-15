import React from "react";

interface BubbleProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "course" | "empty" | "feedback";
  onClick?: () => void;
}

const Bubble: React.FC<BubbleProps> = ({
  children,
  className = "",
  variant = "default",
  onClick,
}) => {
  const base =
    "rounded-xl px-3 py-2 text-xs transition-all duration-200";

  const variants: Record<string, string> = {
    default: "bg-white border border-[var(--gray-150)] text-[var(--gray-700)] shadow-sm hover:shadow-md hover:border-[var(--primary-200)]",
    course:  "bg-white border border-[var(--gray-150)] text-[var(--gray-dark)] shadow-sm hover:shadow-md hover:border-[var(--primary-200)] cursor-pointer",
    empty:   "bg-[var(--gray-light)] border border-dashed border-[var(--gray-200)] text-[var(--gray-400)]",
    feedback:"bg-white border border-[var(--gray-150)] text-[var(--gray-700)] shadow-sm p-3 rounded-xl",
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Bubble;
