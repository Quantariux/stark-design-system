import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Radios are for one choice from a visible few. Beyond about five options a Select is
 * kinder, and a radio group with a single option is a checkbox wearing the wrong control.
 *
 * Arrow keys move between options and the group takes one tab stop — that is the
 * behaviour, and it is why these are not styled checkboxes.
 */
export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable" className="flex flex-col gap-3">
      {[
        { value: "default", label: "Default" },
        { value: "comfortable", label: "Comfortable" },
        { value: "compact", label: "Compact" },
      ].map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupItem value={option.value} id={`density-${option.value}`} />
          <Label htmlFor={`density-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="team" className="flex flex-col gap-4">
      {[
        { value: "personal", label: "Personal", hint: "One seat, private projects." },
        { value: "team", label: "Team", hint: "Shared workspace and billing." },
      ].map((option) => (
        <div key={option.value} className="flex items-start gap-2">
          <RadioGroupItem value={option.value} id={`plan-${option.value}`} className="mt-0.5" />
          <div className="flex flex-col gap-1">
            <Label htmlFor={`plan-${option.value}`}>{option.label}</Label>
            <p className="text-sm text-muted-foreground">{option.hint}</p>
          </div>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="a" disabled className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="disabled-a" />
        <Label htmlFor="disabled-a">Unavailable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="disabled-b" />
        <Label htmlFor="disabled-b">Also unavailable</Label>
      </div>
    </RadioGroup>
  ),
}
