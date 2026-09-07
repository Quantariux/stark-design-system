import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ToastProvider, Toaster, useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

function Demo() {
  const toast = useToast()
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.add({ title: "Settings saved", description: "Your changes are live." })
        }
      >
        Show toast
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast.add({
            type: "error",
            title: "Could not save",
            description: "The server rejected the change.",
          })
        }
      >
        Show error
      </Button>
    </div>
  )
}

/**
 * The viewport is a live region, so the message is announced without taking focus, and
 * the timer pauses on hover and focus — a toast cannot expire while it is being read.
 */
export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Demo />
      <Toaster />
    </ToastProvider>
  ),
}
