import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStatus,
} from "@/components/ui/command"

const meta = {
  title: "UI/Command",
  component: Command,
  tags: ["autodocs"],
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  "Open project",
  "Create task",
  "Search components",
  "Toggle theme",
  "Open settings",
]

const shell =
  "w-96 overflow-hidden rounded-lg bg-popover text-popover-foreground ring-1 ring-foreground/10"

export const Default: Story = {
  render: () => (
    <Command items={items}>
      <div className={shell}>
        <CommandInput placeholder="Type a command..." />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
          {items.map((item) => (
            <CommandItem key={item} value={item}>
              {item}
            </CommandItem>
          ))}
        </CommandList>
        <CommandStatus />
      </div>
    </Command>
  ),
}

export const Grouped: Story = {
  render: () => (
    <Command items={items}>
      <div className={shell}>
        <CommandInput placeholder="Search..." />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandGroupLabel>Actions</CommandGroupLabel>
            {items.slice(0, 2).map((item) => (
              <CommandItem key={item} value={item}>
                {item}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup>
            <CommandGroupLabel>Navigation</CommandGroupLabel>
            {items.slice(2).map((item) => (
              <CommandItem key={item} value={item}>
                {item}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <CommandStatus />
      </div>
    </Command>
  ),
}

/**
 * The state most systems forget. It is a first-class slot here, so it cannot be omitted
 * by accident — and the status region says the count out loud.
 */
export const NoResults: Story = {
  render: () => (
    <Command items={[]}>
      <div className={shell}>
        <CommandInput placeholder="Search for something that does not exist" />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
        </CommandList>
        <CommandStatus />
      </div>
    </Command>
  ),
}
