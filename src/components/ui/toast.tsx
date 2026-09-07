"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { XIcon } from "lucide-react"
import { cn } from "cn"

/*
 * Transient messages, on Base UI's Toast.
 *
 * The primitive is doing the work that makes a toast accessible rather than merely
 * visible: the viewport is a live region, so a message is announced without stealing
 * focus; toasts are reachable by keyboard; and the timer pauses on hover and focus, so a
 * message cannot expire while it is being read. Hand-rolled toasts almost always miss the
 * last two, and the failure is invisible to anyone testing with a mouse.
 *
 * Mount <Toaster /> once, near the root, then call useToast().add({...}) from anywhere.
 */

function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

/** The queue. `add`, `close` and `update` all come from here. */
const useToast = ToastPrimitive.useToastManager

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      data-slot="toast"
      className={cn(
        "absolute right-0 bottom-0 left-auto z-50 w-[--toast-width] rounded-lg bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition-all [--toast-width:22rem] after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-ending-style:opacity-0 data-starting-style:opacity-0",
        "data-[type=error]:bg-destructive data-[type=error]:text-destructive-foreground"
      )}
      style={{
        // The stack: each toast sits above the one before it, scaled slightly back, so the
        // depth is readable at a glance rather than needing to be counted.
        ["--gap" as string]: "0.75rem",
        transform:
          "translateY(calc(var(--toast-offset-y) * -1)) scale(calc(1 - var(--toast-index) * 0.05))",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <ToastPrimitive.Title
            data-slot="toast-title"
            className="text-sm leading-snug font-medium"
          />
          <ToastPrimitive.Description
            data-slot="toast-description"
            className="text-sm text-muted-foreground data-[type=error]:text-destructive-foreground/80"
          />
        </div>
        <ToastPrimitive.Close
          data-slot="toast-close"
          aria-label="Close"
          className="ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <XIcon className="size-3.5" />
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  ))
}

/**
 * Mount once, near the root of the app.
 *
 * Bottom-right by default: it is out of the reading path, and away from the primary
 * action in most layouts, so a toast never covers the button that produced it.
 */
function Toaster({ className, ...props }: ToastPrimitive.Portal.Props) {
  return (
    <ToastPrimitive.Portal {...props}>
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className={cn(
          "fixed right-4 bottom-4 z-50 mx-auto flex w-[22rem] max-w-[calc(100vw-2rem)]",
          className
        )}
      >
        <ToastList />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

export { ToastProvider, Toaster, useToast }
