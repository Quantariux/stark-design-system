"use client"

import * as React from "react"
import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
} from "react-aria-components"
import { cn } from "cn"

/*
 * React Aria's parts do not line up one-to-one with the other trees, and the mismatch is
 * structural rather than cosmetic.
 *
 * RAC's `TooltipTrigger` is the ROOT: it wraps both the trigger and the tooltip. What this
 * system calls TooltipTrigger is just the focusable child inside it. So the names are
 * remapped -- our Tooltip becomes RAC's TooltipTrigger, our TooltipContent becomes RAC's
 * Tooltip -- and a consumer keeps writing the same three components in the same order.
 *
 * There is also no provider. RAC takes `delay` per trigger, so TooltipProvider becomes a
 * context carrying the delay rather than a primitive. The behaviour it exists for is
 * unchanged: one delay configured once, near the root.
 */
const TooltipDelayContext = React.createContext(400)

/**
 * TooltipProvider shares one delay across every tooltip beneath it.
 *
 * Without it each tooltip waits its own full delay, so moving along a toolbar makes you
 * pay the delay again at every stop.
 */
function TooltipProvider({
  delay = 400,
  children,
}: {
  delay?: number
  children?: React.ReactNode
}) {
  return (
    <TooltipDelayContext.Provider value={delay}>{children}</TooltipDelayContext.Provider>
  )
}

function Tooltip(props: React.ComponentProps<typeof AriaTooltipTrigger>) {
  const delay = React.useContext(TooltipDelayContext)
  return <AriaTooltipTrigger delay={delay} {...props} />
}

/*
 * The trigger is the child itself.
 *
 * RAC attaches tooltip behaviour to the focusable element it wraps, so there is no element
 * to render here -- wrapping the child in a span would put a non-focusable node between
 * RAC and the control, and the tooltip would never open on keyboard focus.
 */
function TooltipTrigger({
  render,
  children,
}: {
  render?: React.ReactElement
  children?: React.ReactNode
  className?: string
}) {
  return <>{render ?? children}</>
}

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof AriaTooltip> & { sideOffset?: number }) {
  return (
    <AriaTooltip
      data-slot="tooltip-content"
      offset={sideOffset}
      className={cn(
        "z-50 w-fit max-w-xs rounded-md bg-primary px-2 py-1 text-xs text-balance text-primary-foreground shadow-md transition-[transform,scale,opacity] data-[exiting]:scale-95 data-[exiting]:opacity-0 data-[entering]:scale-95 data-[entering]:opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </AriaTooltip>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
