import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-sm hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground shadow-sm hover:shadow-lg hover:shadow-destructive/25 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-2 border-input bg-background hover:bg-primary/5 hover:border-primary/30 hover:text-primary hover:shadow-sm active:bg-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm active:bg-secondary/90",
        ghost: "hover:bg-primary/10 hover:text-primary active:bg-primary/15",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        success: "bg-gradient-to-br from-success to-success/90 text-success-foreground shadow-sm hover:shadow-lg hover:shadow-success/25 hover:-translate-y-0.5 active:translate-y-0",
        warning: "bg-gradient-to-br from-warning to-warning/90 text-warning-foreground shadow-sm hover:shadow-lg hover:shadow-warning/25 hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
        xs: "h-8 px-2.5 text-xs rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
