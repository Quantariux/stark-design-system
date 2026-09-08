"use client"

import * as React from "react"
import { Button as AriaButton } from "react-aria-components"
import { XIcon } from "lucide-react"
import { cn } from "cn"

/*
 * Transient messages.
 *
 * React Aria's toast exists, but only as UNSTABLE_ToastRegion / UNSTABLE_ToastQueue. A
 * design system distributes source into other people's projects with a caret range on
 * react-aria-components, so an UNSTABLE_ export can disappear in a minor bump and break a
 * consumer who changed nothing. That is not a dependency this tree is willing to take, so
 * the toast is implemented here and will keep working.
 *
 * What that costs, and what is therefore rebuilt rather than skipped: the viewport is a
 * live region so a message is announced without stealing focus; toasts are reachable by
 * keyboard; and the timer pauses on hover and focus, so a message cannot expire while it is
 * being read. That last one is the piece hand-rolled toasts almost always miss, and the
 * failure is invisible to anyone testing with a mouse.
 *
 * Mount <Toaster /> once, near the root, then call useToast().add({...}) from anywhere.
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
const ToastPausedContext = React.createContext(false)

const DEFAULT_DURATION = 5000

function ToastProvider({ children }: { children?: React.ReactNode }) {
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
    <ToastManagerContext.Provider value={manager}>{children}</ToastManagerContext.Provider>
  )
}

/** The queue. `add`, `close` and `update` all come from here. */
function useToast() {
  const manager = React.useContext(ToastManagerContext)
  if (!manager) throw new Error("useToast must be used within <ToastProvider>")
  return manager
}

/**
 * One toast, with a timer that stops while the viewport is hovered or focused.
 *
 * The remaining time is tracked rather than restarted, so pausing to read a message does
 * not hand it a fresh full duration each time the pointer passes over.
 */
function Toast({ toast, index, count }: { toast: ToastItem; index: number; count: number }) {
  const { close } = useToast()
  const paused = React.useContext(ToastPausedContext)
  const remaining = React.useRef(toast.duration ?? DEFAULT_DURATION)
  const startedAt = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (paused) {
      if (startedAt.current !== null) {
        remaining.current -= Date.now() - startedAt.current
        startedAt.current = null
      }
      return
    }

    startedAt.current = Date.now()
    const timer = window.setTimeout(() => close(toast.id), Math.max(0, remaining.current))
    return () => window.clearTimeout(timer)
  }, [paused, close, toast.id])

  const depth = count - 1 - index

  return (
    <div
      data-slot="toast"
      data-type={toast.type}
      className={cn(
        "absolute right-0 bottom-0 left-auto z-50 w-[--toast-width] rounded-lg bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition-all [--toast-width:22rem]",
        "data-[type=error]:bg-destructive data-[type=error]:text-destructive-foreground"
      )}
      style={{
        transform: `translateY(calc(${depth} * -0.75rem)) scale(calc(1 - ${depth} * 0.05))`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div data-slot="toast-title" className="text-sm leading-snug font-medium">
            {toast.title}
          </div>
          <div
            data-slot="toast-description"
            className={cn(
              "text-sm text-muted-foreground",
              toast.type === "error" && "text-destructive-foreground/80"
            )}
          >
            {toast.description}
          </div>
        </div>
        <AriaButton
          data-slot="toast-close"
          aria-label="Close"
          onPress={() => close(toast.id)}
          className="ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[focus-visible]:ring-3 data-[focus-visible]:ring-ring/50 data-[focus-visible]:outline-none"
        >
          <XIcon className="size-3.5" />
        </AriaButton>
      </div>
    </div>
  )
}

/**
 * Mount once, near the root of the app.
 *
 * Bottom-right by default: it is out of the reading path, and away from the primary
 * action in most layouts, so a toast never covers the button that produced it.
 */
function Toaster({ className, ...props }: React.ComponentProps<"div">) {
  const { toasts } = useToast()
  const [paused, setPaused] = React.useState(false)

  return (
    <ToastPausedContext.Provider value={paused}>
      <div
        data-slot="toast-viewport"
        // role="region" with a live region inside: the messages are announced, and the
        // region itself stays reachable so a keyboard user can get to the close buttons.
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        aria-atomic="false"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className={cn(
          "fixed right-4 bottom-4 z-50 mx-auto flex w-[22rem] max-w-[calc(100vw-2rem)]",
          className
        )}
        {...props}
      >
        {toasts.map((toast, index) => (
          <Toast key={toast.id} toast={toast} index={index} count={toasts.length} />
        ))}
      </div>
    </ToastPausedContext.Provider>
  )
}

export { ToastProvider, Toaster, useToast }
