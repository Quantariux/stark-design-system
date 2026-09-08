"use client"

import * as React from "react"
import {
  Button as AriaButton,
  Header as AriaHeader,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  Popover as AriaPopover,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  Separator as AriaSeparator,
} from "react-aria-components"
import { cn } from "cn"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

/*
 * React Aria's Select is a Button showing a SelectValue, with a Popover containing a
 * ListBox. There is no separate Positioner, no Viewport and no scroll buttons -- RAC
 * handles overflow and keyboard scrolling inside the ListBox itself, so the scroll button
 * components exist here only to keep the API identical across trees; they render nothing.
 *
 * Options are addressed by `id`, not `value`, and highlight is data-focused: RAC drives the
 * highlight itself and never moves DOM focus into the list, so a `focus:` selector would
 * never match and the highlighted option would stay unstyled.
 */
const Select = AriaSelect

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof AriaListBoxSection>) {
  return (
    <AriaListBoxSection
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof AriaSelectValue>) {
  return (
    <AriaSelectValue
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof AriaButton> & { size?: "sm" | "default" }) {
  return (
    <AriaButton
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none data-[focus-visible]:border-ring data-[focus-visible]:ring-3 data-[focus-visible]:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <>
        {children as React.ReactNode}
        <ChevronDownIcon
          aria-hidden
          className="pointer-events-none size-4 text-muted-foreground"
        />
      </>
    </AriaButton>
  )
}

function SelectContent({
  className,
  children,
  sideOffset = 4,
  ...props
}: Omit<React.ComponentProps<typeof AriaListBox>, "children"> & {
  sideOffset?: number
  alignItemWithTrigger?: boolean
  children?: React.ReactNode
}) {
  return (
    <AriaPopover
      offset={sideOffset}
      className="isolate z-50 w-(--trigger-width) min-w-36"
    >
      <AriaListBox
        data-slot="select-content"
        className={cn(
          "relative max-h-[inherit] overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
      </AriaListBox>
    </AriaPopover>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof AriaHeader>) {
  return (
    <AriaHeader
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: Omit<React.ComponentProps<typeof AriaListBoxItem>, "children" | "id"> & {
  value?: string
  children?: React.ReactNode
}) {
  return (
    <AriaListBoxItem
      data-slot="select-item"
      id={value}
      textValue={typeof children === "string" ? children : undefined}
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[focused]:bg-accent data-[focused]:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {({ isSelected }) => (
        <>
          <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">{children}</span>
          {isSelected ? (
            <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
              <CheckIcon className="pointer-events-none" />
            </span>
          ) : null}
        </>
      )}
    </AriaListBoxItem>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AriaSeparator>) {
  return (
    <AriaSeparator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/*
 * RAC scrolls the listbox itself and keeps the focused option in view, so there is nothing
 * for these to do. They stay exported, rendering nothing, so markup written against another
 * tree keeps compiling rather than failing on a missing import.
 */
function SelectScrollUpButton() {
  return null
}

function SelectScrollDownButton() {
  return null
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
