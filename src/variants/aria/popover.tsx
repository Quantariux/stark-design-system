"use client"

import * as React from "react"
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Popover as AriaPopover,
  Button as AriaButton,
} from "react-aria-components"
import { cn } from "cn"

/*
 * React Aria builds a popover out of DialogTrigger, Popover and Dialog: the trigger and the
 * popup are siblings inside a trigger root, and the popup's contents live in a Dialog so
 * focus is managed and Escape closes it.
 *
 * The names are remapped so a consumer writes the same components as on the other trees:
 * our Popover is RAC's DialogTrigger, and our PopoverContent is RAC's Popover wrapping a
 * Dialog. Folding the Dialog in rather than exposing it matters -- a Popover without one
 * gets no focus containment and no Escape handling, which is the failure people discover
 * only when they try to use it from the keyboard.
 *
 * Unlike the Radix tree, no id plumbing is needed here: RAC's Heading inside a Dialog is
 * wired to it automatically, so the popup is named without this file doing anything.
 */
function Popover(props: React.ComponentProps<typeof AriaDialogTrigger>) {
  return <AriaDialogTrigger {...props} />
}

/*
 * The trigger is the child itself.
 *
 * RAC attaches the behaviour to the focusable element it wraps, so wrapping it in another
 * element here would break keyboard opening. A bare `children` case still needs a
 * focusable control, so it is given a RAC Button.
 */
function PopoverTrigger({
  className,
  render,
  children,
}: {
  className?: string
  render?: React.ReactElement
  children?: React.ReactNode
}) {
  if (render) return <>{render}</>
  return (
    <AriaButton data-slot="popover-trigger" className={cn(className)}>
      {children}
    </AriaButton>
  )
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 6,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AriaPopover>, "children" | "offset"> & {
  align?: "start" | "center" | "end"
  // RAC calls this `offset`; the system calls it sideOffset on all three trees.
  sideOffset?: number
  children?: React.ReactNode
}) {
  return (
    <AriaPopover
      offset={sideOffset}
      placement={align === "center" ? "bottom" : `bottom ${align}`}
      className={cn(
        "z-50 w-72 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none transition-[transform,scale,opacity] data-[exiting]:scale-95 data-[exiting]:opacity-0 data-[entering]:scale-95 data-[entering]:opacity-0",
        className
      )}
      {...props}
    >
      <AriaDialog data-slot="popover-content" className="p-4 outline-none">
        {children}
      </AriaDialog>
    </AriaPopover>
  )
}

function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<typeof AriaHeading>) {
  return (
    <AriaHeading
      slot="title"
      data-slot="popover-title"
      className={cn("text-sm leading-snug font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Closes the popover. RAC exposes this through the Dialog's `close` render prop. */
function PopoverClose({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof AriaButton> & { render?: React.ReactElement }) {
  return (
    <AriaButton
      data-slot="popover-close"
      slot="close"
      className={cn(className)}
      {...props}
    >
      {render ?? children}
    </AriaButton>
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
}
