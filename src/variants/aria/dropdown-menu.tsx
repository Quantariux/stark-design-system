"use client"

import * as React from "react"
import {
  Button as AriaButton,
  Header as AriaHeader,
  Keyboard as AriaKeyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  Separator as AriaSeparator,
  SubmenuTrigger as AriaSubmenuTrigger,
} from "react-aria-components"
import { cn } from "cn"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

/*
 * React Aria's menu is assembled differently from the other two trees.
 *
 * MenuTrigger is the root wrapping trigger and popup; the popup is a Popover containing a
 * Menu; groups are MenuSection with a Header rather than a Group with a GroupLabel; and
 * checkbox and radio items are ordinary MenuItems under a selectionMode on the section,
 * because RAC models selection on the collection rather than on each item.
 *
 * Highlight is data-focused, where Base UI and Radix both use focus styling on the item --
 * RAC drives keyboard highlight itself and never moves DOM focus into the list, so a
 * `focus:` selector would never match and the highlighted row would stay unstyled.
 */
function DropdownMenu({ ...props }: React.ComponentProps<typeof AriaMenuTrigger>) {
  return <AriaMenuTrigger {...props} />
}

function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  // RAC's Popover portals itself; kept so markup written for another tree still compiles.
  return <>{children}</>
}

function DropdownMenuTrigger({
  render,
  children,
}: {
  render?: React.ReactElement
  children?: React.ReactNode
}) {
  if (render) return <>{render}</>
  return <AriaButton data-slot="dropdown-menu-trigger">{children}</AriaButton>
}

function DropdownMenuContent({
  align = "start",
  sideOffset = 4,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AriaMenu>, "children"> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
  children?: React.ReactNode
}) {
  return (
    <AriaPopover
      offset={sideOffset}
      placement={align === "center" ? "bottom" : `bottom ${align}`}
      className="isolate z-50 outline-none"
    >
      <AriaMenu
        data-slot="dropdown-menu-content"
        className={cn(
          "z-50 max-h-[inherit] min-w-32 overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
      </AriaMenu>
    </AriaPopover>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof AriaMenuSection>) {
  return <AriaMenuSection data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof AriaHeader> & { inset?: boolean }) {
  return (
    <AriaHeader
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7",
        className
      )}
      {...props}
    />
  )
}

const itemClasses =
  "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-[focused]:bg-accent data-[focused]:text-accent-foreground not-data-[variant=destructive]:data-[focused]:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[focused]:bg-destructive/10 data-[variant=destructive]:data-[focused]:text-destructive dark:data-[variant=destructive]:data-[focused]:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive"

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AriaMenuItem> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <AriaMenuItem
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(itemClasses, className)}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof AriaSubmenuTrigger>) {
  return <AriaSubmenuTrigger {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof AriaMenuItem> & { inset?: boolean }) {
  return (
    <AriaMenuItem
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(itemClasses, "data-[open]:bg-accent data-[open]:text-accent-foreground", className)}
      {...props}
    >
      <>
        {children as React.ReactNode}
        <ChevronRightIcon className="ml-auto" />
      </>
    </AriaMenuItem>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn("w-auto min-w-[96px] shadow-lg", className)}
      {...props}
    />
  )
}

/*
 * Selection is modelled on the collection in RAC, so a checkbox item is a MenuItem inside a
 * section with selectionMode="multiple". The tick is rendered from the item's own selection
 * state rather than from a separate Indicator component.
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  inset,
  ...props
}: Omit<React.ComponentProps<typeof AriaMenuItem>, "children"> & {
  inset?: boolean
  checked?: boolean
  children?: React.ReactNode
}) {
  return (
    <AriaMenuItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(itemClasses, "pr-8 pl-1.5", className)}
      {...props}
    >
      {({ isSelected }) => (
        <>
          <span
            className="pointer-events-none absolute right-2 flex items-center justify-center"
            data-slot="dropdown-menu-checkbox-item-indicator"
          >
            {isSelected ? <CheckIcon /> : null}
          </span>
          {children}
        </>
      )}
    </AriaMenuItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof AriaMenuSection>) {
  return (
    <AriaMenuSection
      data-slot="dropdown-menu-radio-group"
      selectionMode="single"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: Omit<React.ComponentProps<typeof AriaMenuItem>, "children"> & {
  inset?: boolean
  children?: React.ReactNode
}) {
  return (
    <AriaMenuItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(itemClasses, "pr-8 pl-1.5", className)}
      {...props}
    >
      {({ isSelected }) => (
        <>
          <span
            className="pointer-events-none absolute right-2 flex items-center justify-center"
            data-slot="dropdown-menu-radio-item-indicator"
          >
            {isSelected ? <CheckIcon /> : null}
          </span>
          {children}
        </>
      )}
    </AriaMenuItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AriaSeparator>) {
  return (
    <AriaSeparator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<typeof AriaKeyboard>) {
  return (
    <AriaKeyboard
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-[focused]/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
