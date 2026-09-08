"use client"

import * as React from "react"
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

/*
 * React Aria splits a modal into four parts where the other trees use two: DialogTrigger
 * wraps everything, ModalOverlay is the backdrop, Modal is the positioned box, and Dialog
 * is the focus-managed contents. The exported names stay the system's own, and Overlay and
 * Modal are folded into DialogContent -- exposing them would let a caller render a Dialog
 * without a Modal, which loses focus containment and Escape.
 *
 * Enter and exit are data-entering / data-exiting here, where Base UI uses data-open and
 * data-closed and Radix data-state. A selector reading the wrong one never matches and the
 * dialog simply appears without animating.
 *
 * There is no portal component: RAC's Modal portals itself. DialogPortal is kept as a
 * passthrough so markup written for another tree still compiles.
 */
function Dialog({ ...props }: React.ComponentProps<typeof AriaDialogTrigger>) {
  return <AriaDialogTrigger {...props} />
}

/*
 * The trigger is the child itself -- RAC attaches behaviour to the focusable element it
 * wraps, so an extra wrapper here would break keyboard opening.
 */
function DialogTrigger({
  render,
  children,
}: {
  render?: React.ReactElement
  children?: React.ReactNode
}) {
  if (render) return <>{render}</>
  return <AriaButton data-slot="dialog-trigger">{children}</AriaButton>
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DialogClose({
  render,
  children,
  className,
  ...props
}: React.ComponentProps<typeof AriaButton> & { render?: React.ReactElement }) {
  return (
    <AriaButton
      data-slot="dialog-close"
      slot="close"
      className={cn(className)}
      {...props}
    >
      {render ?? children}
    </AriaButton>
  )
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AriaModalOverlay>) {
  return (
    <AriaModalOverlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 flex items-center justify-center bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-[entering]:animate-in data-[entering]:fade-in-0 data-[exiting]:animate-out data-[exiting]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Omit<React.ComponentProps<typeof AriaModal>, "children"> & {
  showCloseButton?: boolean
  children?: React.ReactNode
}) {
  return (
    <DialogOverlay>
      <AriaModal
        className={cn(
          "z-50 w-full max-w-[calc(100%-2rem)] duration-100 outline-none sm:max-w-sm data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
          className
        )}
        {...props}
      >
        <AriaDialog
          data-slot="dialog-content"
          className="relative grid gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none"
        >
          {children}
          {showCloseButton && (
            <AriaButton
              data-slot="dialog-close"
              slot="close"
              aria-label="Close"
              className="absolute top-2 right-2"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                render={
                  <span>
                    <XIcon />
                  </span>
                }
              />
            </AriaButton>
          )}
        </AriaDialog>
      </AriaModal>
    </DialogOverlay>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClose>
          <Button variant="outline" render={<span>Close</span>} />
        </DialogClose>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AriaHeading>) {
  return (
    <AriaHeading
      slot="title"
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
