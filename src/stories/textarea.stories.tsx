import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

/** Labelled, like every other control. A placeholder is not a name. */
export const Default: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="ta-default">Description</Label>
      <Textarea id="ta-default" placeholder="Write a description..." />
    </div>
  ),
}

export const WithValue: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="ta-value">Summary</Label>
      <Textarea id="ta-value" defaultValue="Ships with the task." />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="ta-disabled">Notes</Label>
      <Textarea id="ta-disabled" placeholder="Unavailable" disabled />
    </div>
  ),
}

/** aria-invalid drives the styling, so the error state matches what assistive tech hears. */
export const Invalid: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="ta-invalid">Summary</Label>
      <Textarea id="ta-invalid" defaultValue="Too short" aria-invalid />
      <p className="text-sm text-destructive">Use at least 20 characters.</p>
    </div>
  ),
}
