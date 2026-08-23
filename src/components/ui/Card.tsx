"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-bg-panel border border-border",
      elevated: "bg-bg-elevated shadow-md",
      bordered: "bg-bg-panel border-2 border-border-strong",
    };

    const hoverStyles = hover
      ? "transition-all duration-200 hover:border-border-strong hover:shadow-lg"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-6",
          variants[variant],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";