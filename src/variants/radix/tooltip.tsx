"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"
import { cn } from "cn"

/**
 * TooltipProvider shares one delay timer across every tooltip beneath it.
 *
 * Without it each tooltip waits its own full delay, so moving along a toolbar makes you
 * pay the delay again at every stop. With it, the first tooltip opens after the delay and
 * neighbours open immediately — which is the behaviour people read as responsive.
 *
 * Base UI calls the prop `delay`; Radix calls it `delayDuration`. The system's name wins,
 * so a consumer switching primitives does not rewrite their call sites.
 */
function TooltipProvider({
  delay = 400,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Provider>, "delayDuration"> & {
  delay?: number
}) {
  return <TooltipPrimitive.Provider delayDuration={delay} {...props} />
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />
}

/*
 * `render` is this system's composition API on every primitive; Radix spells it `asChild`.
 * Translating here is what lets one story file and one block source work against all three
 * trees rather than each consumer learning which primitive they are on.
 */
function TooltipTrigger({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger> & {
  render?: React.ReactElement
}) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn(className)}
      asChild={Boolean(render)}
      {...props}
    >
      {render ?? children}
    </TooltipPrimitive.Trigger>
  )
}

/*
 * Portal is folded in rather than exposed: forgetting it is how a tooltip ends up clipped
 * inside an `overflow: hidden` ancestor, which only shows up once the component is used
 * somewhere scrollable. Radix positions inside Content, so there is no Positioner here.
 *
 * The exit animation moves from Base UI's data-ending-style to Radix's data-state=closed.
 * There is no enter equivalent — Radix sets data-state=open immediately rather than
 * exposing a from-state — so the tooltip appears at once and fades on close.
 */
function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-md bg-primary px-2 py-1 text-xs text-balance text-primary-foreground shadow-md transition-[transform,scale,opacity] data-[state=closed]:scale-95 data-[state=closed]:opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
