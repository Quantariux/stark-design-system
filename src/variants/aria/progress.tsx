"use client"

import * as React from "react"
import { Label as AriaLabel, ProgressBar as AriaProgressBar } from "react-aria-components"
import { cn } from "cn"

/**
 * A determinate progress bar.
 *
 * The primitive owns the ARIA: role="progressbar" with valuemin/max/now, and the
 * indeterminate state when `value` is null. That matters because a bar whose width is set
 * from state but whose ARIA is not tells a screen-reader user nothing is happening.
 *
 * RAC spells indeterminate as `isIndeterminate` rather than a null value, and it does not
 * size the fill -- so null is translated and the width computed here. Its Label associates
 * itself through ProgressBar's context, which is the one piece of wiring this tree gets for
 * free where the Radix tree had to build it.
 */
const ProgressValueContext = React.createContext<{ value: number | null; max: number }>({
  value: null,
  max: 100,
})

function Progress({
  className,
  value = null,
  max = 100,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof AriaProgressBar>,
  "value" | "maxValue" | "children" | "isIndeterminate"
> & {
  value?: number | null
  max?: number
  children?: React.ReactNode
}) {
  const state = React.useMemo(() => ({ value, max }), [value, max])

  return (
    <ProgressValueContext.Provider value={state}>
      <AriaProgressBar
        data-slot="progress"
        value={value ?? 0}
        maxValue={max}
        isIndeterminate={value === null}
        className={cn("flex w-full flex-col gap-2", className)}
        {...props}
      >
        {children}
        <div
          data-slot="progress-track"
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        >
          {/* Indeterminate fills the track: a zero-width bar reads as "0% done" rather
              than "working", which is the distinction a null value exists to make. */}
          <div
            data-slot="progress-indicator"
            className="h-full rounded-full bg-primary transition-[width] duration-(--duration-base) ease-(--ease-out)"
            style={{
              width: value === null ? "100%" : `${Math.min(100, (value / max) * 100)}%`,
            }}
          />
        </div>
      </AriaProgressBar>
    </ProgressValueContext.Provider>
  )
}

function ProgressLabel({
  className,
  ...props
}: React.ComponentProps<typeof AriaLabel>) {
  return (
    <AriaLabel
      data-slot="progress-label"
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  )
}

/**
 * The formatted value, or nothing while indeterminate.
 *
 * Rendering "0%" for an unknown value would state a fact the component does not have.
 */
function ProgressValue({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { value, max } = React.useContext(ProgressValueContext)
  const percentage = value === null ? null : `${Math.round((value / max) * 100)}%`

  return (
    <span
      data-slot="progress-value"
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    >
      {children ?? percentage}
    </span>
  )
}

export { Progress, ProgressLabel, ProgressValue }
