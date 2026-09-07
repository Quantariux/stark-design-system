import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A dialog interrupts. It should be worth interrupting for — a task that must finish
 * before anything else, not information that could have sat on the page.
 *
 * The title is required, not decorative: it names the dialog for assistive technology,
 * which otherwise announces an unnamed region after focus has already moved into it.
 */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Edit profile</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Change your display name. This is visible to everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dialog-name">Name</Label>
          <Input id="dialog-name" defaultValue="Ada Lovelace" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <DialogClose render={<Button>Save</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/**
 * Destructive confirmations name the consequence, not the action. "Delete project"
 * answers what you are about to lose; "Are you sure?" answers nothing.
 */
export const Destructive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive">Delete project</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription>
            The project and its 12 tasks are removed permanently. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Keep it</Button>} />
          <DialogClose render={<Button variant="destructive">Delete project</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
