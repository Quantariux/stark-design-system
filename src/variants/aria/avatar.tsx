"use client"

import * as React from "react"
import { cn } from "cn"

/*
 * React Aria has no Avatar -- it covers interaction patterns, and an avatar is a picture
 * with a fallback. So the load state is implemented here rather than imported.
 *
 * The behaviour that matters is what happens when the image fails: the fallback must
 * appear, and it must not flash in first while a good image is still loading. Status is
 * tracked per Avatar and shared by context, so Image and Fallback cannot disagree about
 * which of them is showing.
 */
type AvatarStatus = "idle" | "loaded" | "error"

const AvatarContext = React.createContext<{
  status: AvatarStatus
  setStatus: (status: AvatarStatus) => void
} | null>(null)

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"span"> & {
  size?: "default" | "sm" | "lg"
}) {
  const [status, setStatus] = React.useState<AvatarStatus>("idle")
  const value = React.useMemo(() => ({ status, setStatus }), [status])

  return (
    <AvatarContext.Provider value={value}>
      <span
        data-slot="avatar"
        data-size={size}
        className={cn(
          "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  )
}

function AvatarImage({
  className,
  onLoad,
  onError,
  alt = "",
  ...props
}: React.ComponentProps<"img">) {
  const avatar = React.useContext(AvatarContext)

  // A broken image must not linger as a broken-image icon; it is removed and the fallback
  // takes its place.
  if (avatar?.status === "error") return null

  return (
    /*
     * A plain <img>, not next/image. This component installs into projects that may not be
     * Next at all, and next/image would drag a framework dependency into a registry item
     * along with a loader those projects have no way to configure.
     *
     * `alt` defaults to empty, which marks the image decorative. That is right for an
     * avatar: the person is named by the text beside it, and the fallback carries their
     * initials, so a non-empty default would announce the same name twice. A caller with
     * a genuinely informative image can still pass one.
     */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-full object-cover", className)}
      onLoad={(event) => {
        avatar?.setStatus("loaded")
        onLoad?.(event)
      }}
      onError={(event) => {
        avatar?.setStatus("error")
        onError?.(event)
      }}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  const avatar = React.useContext(AvatarContext)

  // Hidden rather than unmounted while the image is still deciding: unmounting would make
  // the initials appear and vanish on every load.
  if (avatar?.status === "loaded") return null

  return (
    <span
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs", className)}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
