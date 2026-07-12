import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/util/ui/utils";
import { Card } from "./ui/card";

interface ContentCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
  icon: LucideIcon;
  title: string;
}

export function ContentCard({
  className,
  children,
  title,
  icon: Icon,
  ...props
}: ContentCardProps) {
  return (
    <Card
      className={cn(
        "p-4 md:p-6 border-2 border-primary/10 relative overflow-hidden site-bg",
        className,
      )}
      {...props}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-tr-full" />

      <div className="flex gap-2 items-center mb-4">
        <Icon className="size-6" />
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="relative z-10">{children}</div>
    </Card>
  );
}
