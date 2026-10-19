import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1246C8] text-white hover:bg-[#0F3BAA]",
        secondary:
          "border-transparent bg-[#F5F7FB] text-[#10264B] hover:bg-[#EEF2F8]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-[#DCE2EB] text-[#172B49]",
        success: "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        warning: "border-transparent bg-[#DCE8FF] text-[#1246C8] hover:bg-[#BFD2FF]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
