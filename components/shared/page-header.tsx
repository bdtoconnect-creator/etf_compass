import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const pageHeaderVariants = cva(
  "flex flex-col gap-1 px-6 py-5",
  {
    variants: {
      variant: {
        default: "",
        compact: "px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  asChild?: boolean;
}

export function PageHeader({
  className,
  variant,
  asChild = false,
  ...props
}: PageHeaderProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp className={cn(pageHeaderVariants({ variant, className }))} {...props} />
  );
}

export function PageTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-2xl font-bold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function PageDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
