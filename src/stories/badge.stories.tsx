import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CheckIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Badge" },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
}

/**
 * A badge is a label, not a control. If it needs to be clicked it is a button — status
 * that responds to a click is the most common way a badge misleads someone.
 */
export const AsStatus: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">
        <CheckIcon />
        Paid
      </Badge>
      <Badge variant="outline">Pending</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  ),
}
