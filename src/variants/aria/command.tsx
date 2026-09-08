"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"
import { cn } from "cn"

/*
 * The searchable list behind command palettes and search screens.
 *
 * React Aria does have a ComboBox, and it is a good one -- but it is popover-shaped: an
 * input with a listbox that opens beneath it. This API is an inline, always-open list; the
 * search block renders it flat inside a card, with no trigger and nothing to open. Forcing
 * RAC's ComboBox into that shape means fighting its open-state management, and it filters
 * internally besides, while this API is filtered by the caller -- the search block computes
 * its own results and passes them in. So the behaviour is implemented directly against the
 * ARIA combobox pattern, the same as the Radix tree.
 *
 * What has to be right, because it is invisible when it is missing: roving highlight
 * through the list while the caret stays in the input, `aria-activedescendant` so the
 * highlighted option is announced as you type, and a status region that says how many
 * results there are. Typing into a filtered list and hearing nothing is the usual outcome
 * of building this by hand.
 *
 * `Empty` is a first-class part, not an afterthought — the no-results state is the single
 * most-skipped screen in any design system, and here it cannot be forgotten.
 */
type CommandState = {
  items: string[]
  listId: string
  activeId: string | undefined
  setActiveId: (id: string | undefined) => void
  register: (id: string) => void
  unregister: (id: string) => void
  order: React.RefObject<string[]>
}

const CommandContext = React.createContext<CommandState | null>(null)

function useCommand() {
  const command = React.useContext(CommandContext)
  if (!command) throw new Error("Command parts must be used within <Command>")
  return command
}

function Command({
  items = [],
  children,
  ...props
}: React.ComponentProps<"div"> & { items?: string[] }) {
  const base = React.useId()
  const [activeId, setActiveId] = React.useState<string | undefined>(undefined)
  const order = React.useRef<string[]>([])

  const state = React.useMemo<CommandState>(
    () => ({
      items,
      listId: `${base}-list`,
      activeId,
      setActiveId,
      register: (id) => {
        if (!order.current.includes(id)) order.current.push(id)
      },
      unregister: (id) => {
        order.current = order.current.filter((entry) => entry !== id)
      },
      order,
    }),
    [items, base, activeId]
  )

  return (
    <CommandContext.Provider value={state}>
      <div data-slot="command" {...props}>
        {children}
      </div>
    </CommandContext.Provider>
  )
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
  onKeyDown,
  ...props
}: React.ComponentProps<"input">) {
  const command = useCommand()

  function move(delta: number) {
    const ids = command.order.current
    if (ids.length === 0) return
    const current = command.activeId ? ids.indexOf(command.activeId) : -1
    const next = (current + delta + ids.length) % ids.length
    command.setActiveId(ids[next])
  }

  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
      <input
        data-slot="command-input"
        role="combobox"
        aria-expanded="true"
        aria-controls={command.listId}
        aria-activedescendant={command.activeId}
        aria-autocomplete="list"
        aria-label={
          ariaLabel ?? (typeof placeholder === "string" ? placeholder : undefined)
        }
        placeholder={placeholder}
        className={cn(
          "flex h-full w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onKeyDown={(event) => {
          // The caret stays in the input; only the highlight moves. Arrow keys that also
          // moved the caret would make the list unusable with a partially typed query.
          if (event.key === "ArrowDown") {
            event.preventDefault()
            move(1)
          } else if (event.key === "ArrowUp") {
            event.preventDefault()
            move(-1)
          } else if (event.key === "Home") {
            event.preventDefault()
            command.setActiveId(command.order.current[0])
          } else if (event.key === "End") {
            event.preventDefault()
            command.setActiveId(command.order.current.at(-1))
          }
          onKeyDown?.(event)
        }}
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
 * Note that a listbox may only contain options and groups: `CommandEmpty` renders
 * `role="status"` and therefore belongs *outside* this element, not within it.
 */
function CommandList({
  className,
  "aria-label": ariaLabel = "Suggestions",
  ...props
}: React.ComponentProps<"div">) {
  const command = useCommand()

  return (
    <div
      data-slot="command-list"
      id={command.listId}
      role="listbox"
      aria-label={ariaLabel}
      className={cn(
        "max-h-72 scroll-py-1 overflow-y-auto overflow-x-hidden p-1",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({ className, children, ...props }: React.ComponentProps<"div">) {
  const command = useCommand()

  return (
    <div
      data-slot="command-empty"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        // Kept mounted so the live region can announce, so when there ARE matches it sits
        // in the layout holding nothing and reserving 48px of blank space above the list.
        // Collapse the padding rather than hiding it: display:none on a live region stops
        // it announcing, which is the reason the element is kept mounted at all.
        "py-6 text-center text-sm text-muted-foreground empty:py-0",
        className
      )}
      {...props}
    >
      {command.items.length === 0 ? children : null}
    </div>
  )
}

function CommandGroup({ className, ...props }: React.ComponentProps<"div">) {
  const labelId = React.useId()

  return (
    <CommandGroupContext.Provider value={labelId}>
      <div
        data-slot="command-group"
        role="group"
        aria-labelledby={labelId}
        className={cn("overflow-hidden p-1 text-foreground", className)}
        {...props}
      />
    </CommandGroupContext.Provider>
  )
}

const CommandGroupContext = React.createContext<string | undefined>(undefined)

function CommandGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  const labelId = React.useContext(CommandGroupContext)

  return (
    <div
      data-slot="command-group-label"
      id={labelId}
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  value,
  onMouseMove,
  ...props
}: React.ComponentProps<"div"> & { value?: string }) {
  const command = useCommand()
  const id = React.useId()
  const { register, unregister } = command

  React.useEffect(() => {
    register(id)
    return () => unregister(id)
  }, [id, register, unregister])

  const highlighted = command.activeId === id

  return (
    <div
      data-slot="command-item"
      id={id}
      role="option"
      aria-selected={highlighted}
      data-highlighted={highlighted ? "" : undefined}
      data-value={value}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-muted data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onMouseMove={(event) => {
        command.setActiveId(id)
        onMouseMove?.(event)
      }}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-separator"
      role="separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/** How many results there are, announced. Sighted users get the list; this is the rest. */
function CommandStatus({ className, children, ...props }: React.ComponentProps<"div">) {
  const command = useCommand()
  const count = command.items.length

  return (
    <div
      data-slot="command-status"
      role="status"
      aria-live="polite"
      className={cn("sr-only", className)}
      {...props}
    >
      {children ?? `${count} ${count === 1 ? "result" : "results"}`}
    </div>
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
