import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Label" },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

/**
 * `htmlFor` is the whole job. Without it the text sits near a control rather than naming
 * it, so the control has no accessible name and clicking the words does nothing.
 */
export const Default: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="label-email">Email</Label>
      <Input id="label-email" type="email" placeholder="you@example.com" />
    </div>
  ),
}

/** Pairing with a checkbox also widens the hit area to the text. */
export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="label-terms" />
      <Label htmlFor="label-terms">Accept the terms</Label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="label-disabled">Workspace</Label>
      <Input id="label-disabled" defaultValue="acme" disabled />
    </div>
  ),
}
