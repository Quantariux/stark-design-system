import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline">Hover or focus</Button>} />
        <TooltipContent>Adds the task to the queue</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

/**
 * One provider, several tooltips: the first waits for the delay, the rest open at once.
 * Moving along a toolbar should not make you pay the delay at every stop.
 */
export const SharedDelay: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-2">
        {["Save", "Duplicate", "Archive"].map((label) => (
          <Tooltip key={label}>
            <TooltipTrigger render={<Button variant="ghost" size="sm">{label}</Button>} />
            <TooltipContent>{label} this item</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
}
