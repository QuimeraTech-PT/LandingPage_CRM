import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-[1.15em] [&_svg]:shrink-0 cursor-pointer active:scale-[0.98] active:translate-y-0",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground shadow-premium border border-white/5 btn-shine hover:-translate-y-[2px] hover:shadow-premium-hover high-contrast:bg-black high-contrast:text-white high-contrast:border-2 high-contrast:border-white high-contrast:hover:bg-yellow-400 high-contrast:hover:text-black",
        primary: 
          "bg-primary text-primary-foreground shadow-premium border border-white/10 btn-shine hover:-translate-y-[2px] hover:shadow-premium-hover high-contrast:bg-black high-contrast:text-white high-contrast:border-2 high-contrast:border-white high-contrast:hover:bg-yellow-400 high-contrast:hover:text-black",
        secondary: 
          "bg-transparent border border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 hover:-translate-y-[1px] hover:shadow-sm high-contrast:border-white high-contrast:text-white high-contrast:hover:bg-yellow-400 high-contrast:hover:text-black",
        outline:
          "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-accent hover:-translate-y-[1px] high-contrast:border-white high-contrast:text-white high-contrast:hover:bg-yellow-400 high-contrast:hover:text-black",
        ghost: 
          "text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all high-contrast:text-white high-contrast:hover:bg-yellow-400 high-contrast:hover:text-black",
        link: 
          "text-primary underline-offset-4 hover:underline p-0 h-auto min-h-0 high-contrast:text-yellow-400",
      },
      size: {
        default: "h-12 px-6 py-3", // ~48px
        sm: "h-11 px-5 py-2 text-xs", // ~44px
        lg: "h-[54px] px-8 py-4 text-base", // ~54px
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  animateIcon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, leftIcon, rightIcon, animateIcon = true, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden")}
          ref={ref}
          {...props}
        >
          {React.isValidElement(children) ? (
            React.cloneElement(children as React.ReactElement<any>, {
              children: (
                <span className="flex items-center justify-center gap-2.5">
                  {leftIcon && (
                    <span className={cn(
                      "transition-transform duration-300",
                      animateIcon && "group-hover:-translate-x-1 force-reduced-motion:group-hover:translate-x-0"
                    )}>
                      {leftIcon}
                    </span>
                  )}
                  {(children.props as any).children}
                  {rightIcon && (
                    <span className={cn(
                      "transition-transform duration-300",
                      animateIcon && "group-hover:translate-x-1.5 force-reduced-motion:group-hover:translate-x-0"
                    )}>
                      {rightIcon}
                    </span>
                  )}
                </span>
              )
            })
          ) : (
            children
          )}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden")}
        ref={ref}
        {...props}
      >
        {leftIcon && (
          <span className={cn(
            "transition-transform duration-300",
            animateIcon && "group-hover:-translate-x-1 force-reduced-motion:group-hover:translate-x-0"
          )}>
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className={cn(
            "transition-transform duration-300",
            animateIcon && "group-hover:translate-x-1.5 force-reduced-motion:group-hover:translate-x-0"
          )}>
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
