"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { SearchIcon } from "lucide-react"
import { cn } from "cn"

/*
 * The searchable list behind command palettes and search screens, on Base UI's Combobox.
 *
 * The primitive owns the parts that are hard and invisible when they are missing: roving
 * focus through the list with the input keeping the caret, `aria-activedescendant` so the
 * highlighted option is announced while you type, and a `Status` region that says how many
 * results there are. Typing into a filtered list and hearing nothing is the usual outcome
 * of building this by hand.
 *
 * `Empty` is a first-class part, not an afterthought — the no-results state is the single
 * most-skipped screen in any design system, and here it cannot be forgotten because the
 * primitive has a slot for it.
 */

function Command(props: ComboboxPrimitive.Root.Props<string>) {
  return <ComboboxPrimitive.Root {...props} />
}

/**
 * The filter input.
 *
 * `aria-label` falls back to the placeholder because this renders as a combobox, and a
 * combobox with no accessible name is announced as an unnamed control. A placeholder is
 * not a name to axe -- rightly, since it vanishes on the first keystroke -- so the common
 * case is made correct here rather than left to every caller to remember.
 */
function CommandInput({
  className,
  "aria-label": ariaLabel,
  placeholder,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
      <ComboboxPrimitive.Input
        data-slot="command-input"
        aria-label={ariaLabel ?? (typeof placeholder === "string" ? placeholder : undefined)}
        placeholder={placeholder}
        className={cn(
          "flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * The results.
 *
 * This renders `role="listbox"`, which ARIA counts as an input field — so it needs its own
 * accessible name, separate from the input's. Without one it is announced as an unnamed
 * list, and "Suggestions" is a better default than nothing while still being overridable.
 *
 * Note that a listbox may only contain options: `CommandEmpty` renders `role="status"` and
 * therefore belongs *outside* this element, not within it.
 */
function CommandList({
  className,
  "aria-label": ariaLabel = "Suggestions",
  ...props
}: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="command-list"
      aria-label={ariaLabel}
      className={cn("max-h-72 scroll-py-1 overflow-y-auto overflow-x-hidden p-1", className)}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CommandGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="command-group"
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    />
  )
}

function CommandGroupLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="command-group-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function CommandItem({ className, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-muted data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/** How many results there are, announced. Sighted users get the list; this is the rest. */
function CommandStatus({ className, ...props }: ComboboxPrimitive.Status.Props) {
  return (
    <ComboboxPrimitive.Status
      data-slot="command-status"
      className={cn("sr-only", className)}
      {...props}
    />
  )
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandItem,
  CommandSeparator,
  CommandStatus,
}
