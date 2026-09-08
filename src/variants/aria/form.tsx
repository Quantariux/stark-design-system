"use client"

import * as React from "react"
import { cn } from "cn"

/*
 * The form layer.
 *
 * This exists because the wiring it does is the part that is almost always wrong when a
 * form is assembled by hand: the label must point at the control, the description and the
 * error must both be announced through `aria-describedby`, and the control must carry
 * `aria-invalid` when it fails. A screen-reader user should hear "Email, we will never
 * share this, enter a valid address" instead of an unlabelled box.
 *
 * Unlike most files in this directory, this one uses no React Aria package -- and that is
 * a deliberate choice rather than an omission. RAC has excellent form support: TextField
 * wires label, description and error together, and FieldError reads native validity. But
 * it wires RAC's own Input, and this system's FormControl takes whatever element the caller
 * passes through `render` -- our Input, Textarea or Select. A plain input handed to a RAC
 * TextField picks up none of that context, so the wiring would silently do nothing, which
 * is worse than not claiming it. Forcing callers to use RAC's Input instead would change
 * the public API, which is the one thing a variant may not do.
 *
 * So the association is built here, from a context that hands out ids. The behaviour that
 * matters -- and that the shared accessibility tests check -- is identical to the Base UI
 * tree; only the machinery underneath differs.
 */
type FieldState = {
  name?: string
  controlId: string
  descriptionId: string
  errorId: string
  error: string | null
  hasDescription: boolean
  registerDescription: () => void
  validateValue: (value: unknown) => void
  markTouched: () => void
  touched: boolean
}

const FormFieldContext = React.createContext<FieldState | null>(null)

function useFormField() {
  const field = React.useContext(FormFieldContext)
  if (!field) throw new Error("Form parts must be used within <FormField>")
  return field
}

function Form({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      data-slot="form"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

/** One labelled control with its description and error. */
function FormField({
  className,
  name,
  validate,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  name?: string
  validate?: (value: unknown) => string | null
}) {
  const base = React.useId()
  const [error, setError] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState(false)
  const [hasDescription, setHasDescription] = React.useState(false)

  const state = React.useMemo<FieldState>(
    () => ({
      name,
      controlId: `${base}-control`,
      descriptionId: `${base}-description`,
      errorId: `${base}-error`,
      error,
      hasDescription,
      touched,
      registerDescription: () => setHasDescription(true),
      markTouched: () => setTouched(true),
      validateValue: (value) => setError(validate ? validate(value) : null),
    }),
    [base, name, error, hasDescription, touched, validate]
  )

  return (
    <FormFieldContext.Provider value={state}>
      <div
        data-slot="form-field"
        data-invalid={error ? true : undefined}
        className={cn("group/form-field flex flex-col items-start gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  const field = useFormField()

  return (
    <label
      htmlFor={field.controlId}
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
 * `render` is how this system composes: pass your own element and the field applies the id,
 * `aria-describedby` and `aria-invalid` to it. That is why this takes a child element
 * rather than rendering an input itself — the system's Input, Textarea and Select all go
 * through here unchanged.
 */
function FormControl({
  className,
  render,
  ...props
}: React.ComponentProps<"div"> & { render?: React.ReactElement }) {
  const field = useFormField()

  const describedBy =
    [field.hasDescription ? field.descriptionId : null, field.error ? field.errorId : null]
      .filter(Boolean)
      .join(" ") || undefined

  const element = render ?? <input />
  const childProps = element.props as Record<string, unknown>

  return React.cloneElement(element, {
    ...props,
    id: field.controlId,
    name: field.name,
    "aria-describedby": describedBy,
    "aria-invalid": field.error ? true : undefined,
    "data-slot": "form-control",
    className: cn("w-full", childProps.className as string, className),
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
      field.markTouched()
      field.validateValue(event.target.value)
      ;(childProps.onBlur as ((e: unknown) => void) | undefined)?.(event)
    },
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      // Only after the first blur: validating every keystroke tells someone their input is
      // wrong before they have finished typing it.
      if (field.touched) field.validateValue(event.target.value)
      ;(childProps.onChange as ((e: unknown) => void) | undefined)?.(event)
    },
  } as Record<string, unknown>)
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const field = useFormField()
  const registerDescription = field.registerDescription

  React.useEffect(() => {
    registerDescription()
  }, [registerDescription])

  return (
    <p
      id={field.descriptionId}
      data-slot="form-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * The error message.
 *
 * Rendered only when the field is invalid, and announced because it is in the control's
 * `aria-describedby`. It is deliberately not a tooltip or a toast: an error about one
 * field belongs beside that field, where it can be re-read.
 */
function FormError({ className, children, ...props }: React.ComponentProps<"p">) {
  const field = useFormField()
  if (!field.error) return null

  return (
    <p
      id={field.errorId}
      data-slot="form-error"
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {children ?? field.error}
    </p>
  )
}

/** A group of related fields. Legend names the group for assistive technology. */
function FormFieldset({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="form-fieldset"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function FormLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend
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
