"use client"

import * as React from "react"
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components"
import { cn } from "cn"

/*
 * RAC renders each Radio as a <label> around a visually hidden input, so focus lives on the
 * input and is read from data-focus-visible rather than the :focus-visible pseudo-class.
 * Selection is data-selected, not Base UI's data-checked.
 *
 * The dot is rendered through RAC's render-prop children so it exists only while selected;
 * hiding it with CSS would leave it in the accessibility tree inside an unselected radio.
 */
function RadioGroup({
  className,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof AriaRadioGroup>, "onChange"> & {
  onValueChange?: (value: string) => void
}) {
  return (
    <AriaRadioGroup
      data-slot="radio-group"
      onChange={onValueChange}
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof AriaRadio>, "children" | "isDisabled"> & {
  disabled?: boolean
}) {
  return (
    <AriaRadio
      data-slot="radio-group-item"
      isDisabled={disabled}
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-selected:border-input after:absolute after:-inset-x-3 after:-inset-y-2 data-[focus-visible]:border-ring data-[focus-visible]:ring-3 data-[focus-visible]:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-selected:border-primary data-selected:bg-primary data-selected:text-primary-foreground group-has-[:focus-visible]/field-label:data-selected:border-primary dark:data-selected:bg-primary",
        className
      )}
      {...props}
    >
      {({ isSelected }) =>
        isSelected ? (
          <span
            data-slot="radio-group-indicator"
            className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground"
          />
        ) : null
      }
    </AriaRadio>
  )
}

export { RadioGroup, RadioGroupItem }
