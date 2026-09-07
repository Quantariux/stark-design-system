import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Skeleton } from "@/components/ui/skeleton"

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
}

/**
 * A skeleton should have the shape of what is coming.
 *
 * A generic grey block that is replaced by content of a different size makes the page jump
 * — the loading state has to be a promise the loaded state keeps.
 */
export const MatchingTheContent: Story = {
  render: () => (
    <div className="flex w-80 items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  ),
}

export const Card: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3 rounded-xl p-4 ring-1 ring-foreground/10">
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  ),
}
