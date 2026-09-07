import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { AlertTriangleIcon, InfoIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

/**
 * An alert stays on the page; a toast leaves. Use this for a condition that is still true
 * — a toast for something that just happened.
 */
export const Default: Story = {
  render: () => (
    <Alert className="w-96">
      <InfoIcon />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        This workspace is read-only until billing is resolved.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-96">
      <AlertTriangleIcon />
      <AlertTitle>Could not save</AlertTitle>
      <AlertDescription>
        The server rejected the change. Your edits are still here.
      </AlertDescription>
    </Alert>
  ),
}

/** Title alone, when the description would only restate it. */
export const TitleOnly: Story = {
  render: () => (
    <Alert className="w-96">
      <InfoIcon />
      <AlertTitle>Changes are saved automatically.</AlertTitle>
    </Alert>
  ),
}
