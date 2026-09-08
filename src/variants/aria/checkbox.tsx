"use client"

import * as React from "react"
import { Checkbox as AriaCheckbox } from "react-aria-components"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"

/*
 * RAC renders a <label> wrapping a visually hidden input, so the styled element is the
 * label and focus lands on the input -- which is why focus is read from data-focus-visible
 * rather than the :focus-visible pseudo-class, and selection from data-selected rather than
 * Base UI's data-checked.
 *
 * The tick is rendered through RAC's render-prop children, so it exists only while
 * selected. Hiding it with CSS instead would leave it in the accessibility tree, where a
 * screen reader can find a checkmark inside an unchecked box.
 */
function Checkbox({
  className,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  ...props
}: Omit<
  React.ComponentProps<typeof AriaCheckbox>,
  "children" | "isSelected" | "defaultSelected" | "isDisabled" | "onChange"
> & {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <AriaCheckbox
      data-slot="checkbox"
      isSelected={checked}
      defaultSelected={defaultChecked}
      isDisabled={disabled}
      onChange={onCheckedChange}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-selected:border-input after:absolute after:-inset-x-3 after:-inset-y-2 data-[focus-visible]:border-ring data-[focus-visible]:ring-3 data-[focus-visible]:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-selected:border-primary data-selected:bg-primary data-selected:text-primary-foreground group-has-[:focus-visible]/field-label:data-selected:border-primary dark:data-selected:bg-primary",
        className
      )}
      {...props}
    >
      {({ isSelected }) =>
        isSelected ? (
          <span
            data-slot="checkbox-indicator"
            className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
          >
            <CheckIcon />
          </span>
        ) : null
      }
    </AriaCheckbox>
  )
}

export { Checkbox }
