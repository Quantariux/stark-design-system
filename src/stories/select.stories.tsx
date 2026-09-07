import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A select needs a label like any other field. The trigger shows the current value, so
 * without one the control reads as its value and nothing says what the value is *of*.
 */
export const Default: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="select-fruit">Fruit</Label>
      <Select>
        <SelectTrigger id="select-fruit">
          <SelectValue placeholder="Choose a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Grouped: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="select-timezone">Timezone</Label>
      <Select>
        <SelectTrigger id="select-timezone">
          <SelectValue placeholder="Choose a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="gmt">London</SelectItem>
            <SelectItem value="cet">Berlin</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="est">New York</SelectItem>
            <SelectItem value="pst">Los Angeles</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const WithValue: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="select-density">Density</Label>
      <Select defaultValue="comfortable">
        <SelectTrigger id="select-density">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="compact">Compact</SelectItem>
          <SelectItem value="comfortable">Comfortable</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="select-disabled">Plan</Label>
      <Select disabled defaultValue="team">
        <SelectTrigger id="select-disabled">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="team">Team</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}
