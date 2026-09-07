import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Open</Button>} />
      <PopoverContent>
        <PopoverTitle>Dimensions</PopoverTitle>
        <PopoverDescription className="mt-1">
          Set the size for this layer.
        </PopoverDescription>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="popover-width">Width</Label>
            <Input id="popover-width" defaultValue="320" className="w-24" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="popover-height">Height</Label>
            <Input id="popover-height" defaultValue="180" className="w-24" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}
