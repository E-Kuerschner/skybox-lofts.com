import * as React from "react";
import { cn } from "~/lib/utils";
import { Card } from "./ui/card";

interface ContentCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
}

export function ContentCard({
  className,
  children,
  ...props
}: ContentCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl shadow-xl p-8 md:p-12 border-4 border-[#2d5016]/10 relative overflow-hidden",
        className,
      )}
      {...props}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2d5016]/5 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-900/5 rounded-tr-full" />

      <div className="relative z-10">{children}</div>
    </Card>
  );
}
