import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A placeholder is not a label. It disappears the moment someone types, so the field
 * loses its name exactly when they need to check what they are filling in — and axe
 * treats a placeholder-only field as unlabelled for that reason.
 */
export const Default: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const WithValue: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" defaultValue="Ada Lovelace" />
    </div>
  ),
}

export const Invalid: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="invalid-email">Email</Label>
      <Input id="invalid-email" defaultValue="not-an-email" aria-invalid />
      <p className="text-sm text-destructive">Enter a valid email address.</p>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="disabled-input">Workspace</Label>
      <Input id="disabled-input" defaultValue="acme" disabled />
    </div>
  ),
}

export const Types: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      {[
        { id: "type-text", label: "Text", type: "text" },
        { id: "type-password", label: "Password", type: "password" },
        { id: "type-number", label: "Number", type: "number" },
        { id: "type-file", label: "File", type: "file" },
      ].map((field) => (
        <div key={field.id} className="flex flex-col gap-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input id={field.id} type={field.type} />
        </div>
      ))}
    </div>
  ),
}
