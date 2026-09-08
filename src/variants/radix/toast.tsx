"use client"

import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { XIcon } from "lucide-react"
import { cn } from "cn"

/*
 * Transient messages, on Radix's Toast.
 *
 * The primitive is doing the work that makes a toast accessible rather than merely
 * visible: the viewport is a live region, so a message is announced without stealing
 * focus; toasts are reachable by keyboard; and the timer pauses on hover and focus, so a
 * message cannot expire while it is being read. Hand-rolled toasts almost always miss the
 * last two, and the failure is invisible to anyone testing with a mouse.
 *
 * Mount <Toaster /> once, near the root, then call useToast().add({...}) from anywhere.
 *
 * The queue is built here because Radix does not have one. Base UI ships a toast manager --
 * add, close, update, and the list to render -- while Radix is purely declarative: you own
 * the array and render a Root per entry. Rather than expose that difference and make every
 * caller write two versions, the manager is reimplemented on top of Radix so `useToast()`
 * means the same thing under either primitive.
 */
type ToastType = "success" | "error" | "warning" | "info"

type ToastItem = {
  id: string
  type?: ToastType
  title?: React.ReactNode
  description?: React.ReactNode
  duration?: number
}

type ToastManager = {
  toasts: ToastItem[]
  add: (toast: Omit<ToastItem, "id">) => string
  close: (id: string) => void
  update: (id: string, patch: Partial<Omit<ToastItem, "id">>) => void
}

const ToastManagerContext = React.createContext<ToastManager | null>(null)

function ToastProvider({
  children,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  // A counter rather than Math.random: ids must be stable between server and client, and
  // two toasts added in the same tick must not collide.
  const nextId = React.useRef(0)

  const manager = React.useMemo<ToastManager>(
    () => ({
      toasts,
      add: (toast) => {
        const id = `toast-${nextId.current++}`
        setToasts((current) => [...current, { ...toast, id }])
        return id
      },
      close: (id) => setToasts((current) => current.filter((t) => t.id !== id)),
      update: (id, patch) =>
        setToasts((current) =>
          current.map((t) => (t.id === id ? { ...t, ...patch } : t))
        ),
    }),
    [toasts]
  )

  return (
    <ToastManagerContext.Provider value={manager}>
      <ToastPrimitive.Provider {...props}>{children}</ToastPrimitive.Provider>
    </ToastManagerContext.Provider>
  )
}

/** The queue. `add`, `close` and `update` all come from here. */
function useToast() {
  const manager = React.useContext(ToastManagerContext)
  if (!manager) {
    throw new Error("useToast must be used within <ToastProvider>")
  }
  return manager
}

function ToastList() {
  const { toasts, close } = useToast()

  return toasts.map((toast, index) => (
    <ToastPrimitive.Root
      key={toast.id}
      open
      duration={toast.duration}
      onOpenChange={(open) => {
        if (!open) close(toast.id)
      }}
      data-slot="toast"
      data-type={toast.type}
      className={cn(
        "absolute right-0 bottom-0 left-auto z-50 w-[--toast-width] rounded-lg bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition-all [--toast-width:22rem] after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-[state=closed]:opacity-0",
        "data-[type=error]:bg-destructive data-[type=error]:text-destructive-foreground"
      )}
      style={{
        // The stack: each toast sits above the one before it, scaled slightly back, so the
        // depth is readable at a glance rather than needing to be counted.
        //
        // Base UI supplies --toast-index and --toast-offset-y; Radix supplies neither, so
        // the position in the queue is the index and the offset is derived from it.
        ["--gap" as string]: "0.75rem",
        ["--toast-index" as string]: String(toasts.length - 1 - index),
        transform: `translateY(calc((${toasts.length - 1 - index}) * -0.75rem)) scale(calc(1 - ${toasts.length - 1 - index} * 0.05))`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <ToastPrimitive.Title
            data-slot="toast-title"
            className="text-sm leading-snug font-medium"
          >
            {toast.title}
          </ToastPrimitive.Title>
          <ToastPrimitive.Description
            data-slot="toast-description"
            className={cn(
              "text-sm text-muted-foreground",
              toast.type === "error" && "text-destructive-foreground/80"
            )}
          >
            {toast.description}
          </ToastPrimitive.Description>
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
function Toaster({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed right-4 bottom-4 z-50 mx-auto flex w-[22rem] max-w-[calc(100vw-2rem)]",
        className
      )}
      {...props}
    >
      <ToastList />
    </ToastPrimitive.Viewport>
  )
}

export { ToastProvider, Toaster, useToast }
