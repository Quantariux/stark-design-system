"use client"

import * as React from "react"
import { Switch as AriaSwitch } from "react-aria-components"
import { cn } from "cn"

/*
 * React Aria diverges from the other two trees in two ways, and both are absorbed here so
 * the same story and the same block compile against all three.
 *
 * Prop names. RAC uses isSelected / defaultSelected / isDisabled where the DOM -- and Base
 * UI and Radix with it -- use checked / defaultChecked / disabled. Passing `defaultChecked`
 * to RAC is not an error: it is an unknown prop, silently ignored, and the switch renders
 * off while the caller believes it is on. That is exactly what happened on the first
 * attempt here.
 *
 * State attribute. RAC marks selection with data-selected, where Base UI uses data-checked
 * and Radix data-state="checked". A selector reading the wrong one never matches, so the
 * control works and simply never looks on.
 *
 * The structure differs too but needs no translation: RAC renders a <label> wrapping a
 * visually hidden input with role="switch", and it forwards `id` to that input -- so an
 * external <Label htmlFor> still points at the focusable control, which is what the stories
 * rely on. RAC has no separate Thumb, so the thumb is a span carrying the same data-slot
 * the other trees use.
 */
function Switch({
  className,
  size = "default",
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof AriaSwitch>,
  "children" | "isSelected" | "defaultSelected" | "isDisabled" | "onChange"
> & {
  children?: React.ReactNode
  size?: "sm" | "default"
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <AriaSwitch
      data-slot="switch"
      data-size={size}
      isSelected={checked}
      defaultSelected={defaultChecked}
      isDisabled={disabled}
      onChange={onCheckedChange}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-[focus-visible]:border-ring data-[focus-visible]:ring-3 data-[focus-visible]:ring-ring/50 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] data-selected:bg-primary not-data-selected:bg-input dark:not-data-selected:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-selected/switch:translate-x-[calc(100%-2px)] group-not-data-selected/switch:translate-x-0 dark:group-data-selected/switch:bg-primary-foreground dark:group-not-data-selected/switch:bg-foreground"
      />
      {children}
    </AriaSwitch>
  )
}

export { Switch }
