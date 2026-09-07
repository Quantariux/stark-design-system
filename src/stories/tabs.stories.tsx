import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Tabs are for alternative views of one thing, not for steps.
 *
 * Nothing enforces an order here and nothing carries progress, so using them for a
 * sequence gives people no idea how far through they are — that is what the onboarding
 * block's Progress is for.
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4 text-sm text-muted-foreground">
        A summary of the project and its recent changes.
      </TabsContent>
      <TabsContent value="activity" className="mt-4 text-sm text-muted-foreground">
        Who did what, most recent first.
      </TabsContent>
      <TabsContent value="settings" className="mt-4 text-sm text-muted-foreground">
        Configuration for this project only.
      </TabsContent>
    </Tabs>
  ),
}

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="preview" className="w-96">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="mt-4 text-sm text-muted-foreground">
        The rendered component.
      </TabsContent>
      <TabsContent value="code" className="mt-4 text-sm text-muted-foreground">
        The source it was rendered from.
      </TabsContent>
    </Tabs>
  ),
}

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-96">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="mt-4 text-sm text-muted-foreground">
        Billing is unavailable on this plan.
      </TabsContent>
    </Tabs>
  ),
}
