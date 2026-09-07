import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const meta = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A switch applies immediately; a checkbox waits for submit. Use this one only where the
 * change takes effect the moment it is flipped — otherwise the control lies about when
 * something happened.
 */
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  ),
}

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="notifications" defaultChecked />
      <Label htmlFor="notifications">Notifications</Label>
    </div>
  ),
}

export const InARow: Story = {
  render: () => (
    <div className="flex w-80 flex-col divide-y">
      {[
        { id: "row-releases", title: "Release notes", on: true },
        { id: "row-mentions", title: "Mentions", on: true },
        { id: "row-digest", title: "Weekly digest", on: false },
      ].map((row) => (
        <div key={row.id} className="flex items-center justify-between py-3">
          <Label htmlFor={row.id}>{row.title}</Label>
          <Switch id={row.id} defaultChecked={row.on} />
        </div>
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="switch-disabled" disabled />
      <Label htmlFor="switch-disabled">Unavailable</Label>
    </div>
  ),
}
