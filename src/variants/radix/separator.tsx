import * as SeparatorPrimitive from "@radix-ui/react-separator"
import * as React from "react"
import { cn } from "cn"

/**
 * A visual divider.
 *
 * The primitive sets `role="separator"` and the orientation, so a decorative rule and a
 * meaningful one are distinguishable to assistive technology rather than both being an
 * anonymous bordered div.
 */
function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      orientation={orientation}
      decorative={false}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
