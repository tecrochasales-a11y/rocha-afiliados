import * as React from "react";
import { cn } from "@/lib/utils";

interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card rounded-xl border border-border p-4 space-y-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
MobileCard.displayName = "MobileCard";

interface MobileCardRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  children: React.ReactNode;
}

const MobileCardRow = React.forwardRef<HTMLDivElement, MobileCardRowProps>(
  ({ label, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex justify-between items-center gap-2", className)}
      {...props}
    >
      <span className="text-xs text-muted-foreground font-medium shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right truncate">{children}</span>
    </div>
  )
);
MobileCardRow.displayName = "MobileCardRow";

export { MobileCard, MobileCardRow };
