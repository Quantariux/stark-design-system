import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Button" },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

/**
 * An icon-only button still needs a name. Without aria-label the icon is the whole
 * content, and the control is announced as "button" with nothing after it.
 */
export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="icon-sm" aria-label="Add item">
        <PlusIcon />
      </Button>
      <Button size="icon" aria-label="Add item">
        <PlusIcon />
      </Button>
      <Button size="icon-lg" variant="outline" aria-label="Add item">
        <PlusIcon />
      </Button>
    </div>
  ),
}

export const Disabled: Story = { args: { disabled: true } }
