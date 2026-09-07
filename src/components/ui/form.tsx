"use client"

import { Field as FieldPrimitive } from "@base-ui/react/field"
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset"
import { Form as FormPrimitive } from "@base-ui/react/form"
import { cn } from "cn"

/*
 * The form layer, built on Base UI's Field.
 *
 * This exists because the wiring it does is the part that is almost always wrong when a
 * form is assembled by hand: the label must point at the control, the description and the
 * error must both be announced through `aria-describedby`, and the control must carry
 * `aria-invalid` when it fails. Field does all of that from the composition itself, so a
 * screen-reader user hears "Email, we will never share this, enter a valid address"
 * instead of an unlabelled box.
 *
 * Nothing here re-implements that. These components are the system's spacing and type
 * applied to the primitive, which is the only part that should be ours.
 */

function Form({ className, ...props }: FormPrimitive.Props) {
  return (
    <FormPrimitive
      data-slot="form"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

/** One labelled control with its description and error. */
function FormField({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      data-slot="form-field"
      className={cn("flex flex-col items-start gap-2", className)}
      {...props}
    />
  )
}

function FormLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      data-slot="form-label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]/form-field:opacity-50 data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/**
 * The control slot.
 *
 * `render` is how Base UI composes: pass your own element and Field applies the id,
 * `aria-describedby` and `aria-invalid` to it. That is why this takes a child element
 * rather than rendering an input itself — the system's Input, Textarea and Select all go
 * through here unchanged.
 */
function FormControl({ className, ...props }: FieldPrimitive.Control.Props) {
  return (
    <FieldPrimitive.Control
      data-slot="form-control"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

function FormDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      data-slot="form-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * The error message.
 *
 * Rendered only when the field is invalid, and announced because Field has already put it
 * in the control's `aria-describedby`. It is deliberately not a tooltip or a toast: an
 * error about one field belongs beside that field, where it can be re-read.
 */
function FormError({ className, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      data-slot="form-error"
      className={cn("text-sm text-destructive", className)}
      {...props}
    />
  )
}

/** A group of related fields. Legend names the group for assistive technology. */
function FormFieldset({ className, ...props }: FieldsetPrimitive.Root.Props) {
  return (
    <FieldsetPrimitive.Root
      data-slot="form-fieldset"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function FormLegend({ className, ...props }: FieldsetPrimitive.Legend.Props) {
  return (
    <FieldsetPrimitive.Legend
      data-slot="form-legend"
      className={cn("text-base leading-snug font-medium", className)}
      {...props}
    />
  )
}

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormError,
  FormFieldset,
  FormLegend,
}
