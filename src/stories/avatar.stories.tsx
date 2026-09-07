import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The fallback is not optional. Avatar images fail often — deleted accounts, blocked
 * hosts, offline — and initials are what stops a broken image icon standing in for a
 * person.
 */
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
}

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/80?img=5" alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  ),
}

/** A URL that cannot load. The fallback takes over rather than leaving a broken image. */
export const BrokenImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://example.invalid/missing.png" alt="Alan Turing" />
      <AvatarFallback>AT</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {["size-6", "size-8", "size-10", "size-14"].map((size) => (
        <Avatar key={size} className={size}>
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
}
