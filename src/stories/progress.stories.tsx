import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"

const meta = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  // Meta-level args so each story inherits a valid baseline; the stories below override
  // `value` via render, which is what they are actually demonstrating.
  args: { value: 0 },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Progress value={62} className="w-80" aria-label="Upload progress" />,
}

export const WithLabel: Story = {
  render: () => (
    <Progress value={62} className="w-80">
      <div className="flex items-center justify-between">
        <ProgressLabel>Uploading assets</ProgressLabel>
        <ProgressValue />
      </div>
    </Progress>
  ),
}

/**
 * No value means indeterminate: the primitive drops aria-valuenow rather than reporting a
 * number it does not have, so "working" and "0% done" stay distinguishable.
 */
export const Indeterminate: Story = {
  render: () => (
    <Progress value={null} className="w-80">
      <ProgressLabel>Preparing</ProgressLabel>
    </Progress>
  ),
}

export const Complete: Story = {
  render: () => (
    <Progress value={100} className="w-80">
      <div className="flex items-center justify-between">
        <ProgressLabel>Done</ProgressLabel>
        <ProgressValue />
      </div>
    </Progress>
  ),
}
