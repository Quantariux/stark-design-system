"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import * as React from "react"
import { cn } from "cn"

/*
 * Radix ships Title and Description on Dialog but not on Popover, so the association is
 * rebuilt here rather than quietly dropped.
 *
 * Without it the popup is an anonymous group: a screen reader reads the content with
 * nothing naming what it belongs to, and the Base UI tree would be accessible while the
 * Radix tree was not — the two trees have to be equivalent, not merely both present. Ids
 * are generated once and shared by context, and each part registers itself so the popup is
 * only labelled by elements that actually rendered.
 */
type PopoverLabelling = {
  titleId: string
  descriptionId: string
  hasTitle: boolean
  hasDescription: boolean
  register: (part: "title" | "description") => void
}

const PopoverLabellingContext = React.createContext<PopoverLabelling | null>(null)

function Popover({
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const base = React.useId()
  const [hasTitle, setHasTitle] = React.useState(false)
  const [hasDescription, setHasDescription] = React.useState(false)

  const value = React.useMemo<PopoverLabelling>(
    () => ({
      titleId: base + "-title",
      descriptionId: base + "-description",
      hasTitle,
      hasDescription,
      register: (part) =>
        part === "title" ? setHasTitle(true) : setHasDescription(true),
    }),
    [base, hasTitle, hasDescription]
  )

  return (
    <PopoverLabellingContext.Provider value={value}>
      <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
    </PopoverLabellingContext.Provider>
  )
}

function PopoverTrigger({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger> & {
  render?: React.ReactElement
}) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn(className)}
      asChild={Boolean(render)}
      {...props}
    >
      {render ?? children}
    </PopoverPrimitive.Trigger>
  )
}

/**
 * The popup, already portalled and positioned.
 *
 * Portal is folded in rather than exposed, because forgetting it is the usual way a popover
 * ends up clipped inside an `overflow: hidden` ancestor — a bug that only appears once the
 * component is used somewhere scrollable. Radix positions within Content, so unlike the
 * Base UI tree there is no separate Positioner.
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const labelling = React.useContext(PopoverLabellingContext)

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        aria-labelledby={labelling?.hasTitle ? labelling.titleId : undefined}
        aria-describedby={
          labelling?.hasDescription ? labelling.descriptionId : undefined
        }
        className={cn(
          "z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-lg bg-popover p-4 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none transition-[transform,scale,opacity] data-[state=closed]:scale-95 data-[state=closed]:opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  const labelling = React.useContext(PopoverLabellingContext)
  const register = labelling?.register

  React.useEffect(() => {
    register?.("title")
  }, [register])

  return (
    <h2
      id={labelling?.titleId}
      data-slot="popover-title"
      className={cn("text-sm leading-snug font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  const labelling = React.useContext(PopoverLabellingContext)
  const register = labelling?.register

  React.useEffect(() => {
    register?.("description")
  }, [register])

  return (
    <p
      id={labelling?.descriptionId}
      data-slot="popover-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function PopoverClose({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close> & {
  render?: React.ReactElement
}) {
  return (
    <PopoverPrimitive.Close
      data-slot="popover-close"
      className={cn(className)}
      asChild={Boolean(render)}
      {...props}
    >
      {render ?? children}
    </PopoverPrimitive.Close>
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
