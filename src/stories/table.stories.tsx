import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Table } from '@/components/ui/table';

const meta = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
