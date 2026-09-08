"use client"

import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"
import { cn } from "cn"

/**
 * A determinate progress bar.
 *
 * The primitive owns the ARIA: `role="progressbar"` with valuemin/max/now, and the
 * indeterminate state when `value` is null. That matters because a bar whose width is set
 * from state but whose ARIA is not tells a screen-reader user nothing is happening.
 *
 * Radix provides only Root and Indicator -- no Track, Label or Value, and it does not size
 * the indicator. So the fill width, the percentage text and the label association are all
 * built here. Sharing them through context rather than asking the caller to pass `value`
 * to each part is what keeps the API identical to the Base UI tree: a consumer writes the
 * same markup either way.
 */
type ProgressState = {
  value: number | null
  max: number
  labelId: string
  hasLabel: boolean
  registerLabel: () => void
}

const ProgressContext = React.createContext<ProgressState | null>(null)

function Progress({
  className,
  value = null,
  max = 100,
  children,
  ...props
}: Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> & {
  value?: number | null
}) {
  const labelId = React.useId()
  const [hasLabel, setHasLabel] = React.useState(false)

  const state = React.useMemo<ProgressState>(
    () => ({
      value,
      max,
      labelId,
      hasLabel,
      registerLabel: () => setHasLabel(true),
    }),
    [value, max, labelId, hasLabel]
  )

  return (
    <ProgressContext.Provider value={state}>
      <ProgressPrimitive.Root
        data-slot="progress"
        value={value}
        max={max}
        aria-labelledby={hasLabel ? labelId : undefined}
        className={cn("flex w-full flex-col gap-2", className)}
        {...props}
      >
        {children}
        <div
          data-slot="progress-track"
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        >
          {/*
            Radix leaves sizing to the consumer -- it sets data-state and data-value but no
            width -- so an unstyled Indicator renders a bar that never moves. Indeterminate
            fills the track, because a zero-width bar reads as "0% done" rather than
            "working", which is the distinction the null value exists to make.
          */}
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className="h-full rounded-full bg-primary transition-[width] duration-(--duration-base) ease-(--ease-out)"
            style={{
              width: value === null ? "100%" : `${Math.min(100, (value / max) * 100)}%`,
            }}
          />
        </div>
      </ProgressPrimitive.Root>
    </ProgressContext.Provider>
  )
}

function ProgressLabel({ className, ...props }: React.ComponentProps<"span">) {
  const progress = React.useContext(ProgressContext)
  const registerLabel = progress?.registerLabel

  React.useEffect(() => {
    registerLabel?.()
  }, [registerLabel])

  return (
    <span
      id={progress?.labelId}
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
  const progress = React.useContext(ProgressContext)
  const percentage =
    progress && progress.value !== null
      ? `${Math.round((progress.value / progress.max) * 100)}%`
      : null

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
