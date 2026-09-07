import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Registry</CardTitle>
        <CardDescription>32 items, checked on every build.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Components, page blocks and the theme, distributed as one set.
      </CardContent>
    </Card>
  ),
}

/** CardAction sits in the header's second column, so the title keeps the first. */
export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Next invoice on 1 October.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Manage
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        You are on the Team plan.
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your work address.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="card-email">Email</Label>
          <Input id="card-email" type="email" placeholder="you@example.com" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Continue</Button>
      </CardFooter>
    </Card>
  ),
}

/** The compact size, for metric tiles where four sit in a row. */
export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-56">
      <CardHeader>
        <CardDescription>Revenue</CardDescription>
        <CardTitle className="text-xl tabular-nums">$45,231</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">+20.1% from last period</p>
      </CardContent>
    </Card>
  ),
}
