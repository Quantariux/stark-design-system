import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const meta = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const rows = [
  { id: "INV-001", customer: "Ada Lovelace", status: "Paid", amount: "$250.00" },
  { id: "INV-002", customer: "Alan Turing", status: "Pending", amount: "$150.00" },
  { id: "INV-003", customer: "Grace Hopper", status: "Failed", amount: "$350.00" },
]

/**
 * A caption names the table for assistive technology, which otherwise announces only
 * "table" and a column count. Numbers are right-aligned and tabular so they compare down
 * the column rather than shifting with each digit.
 */
export const Default: Story = {
  render: () => (
    <Table className="w-[36rem]">
      <TableCaption>Invoices from the last 30 days.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.customer}</TableCell>
            <TableCell>
              <Badge variant={row.status === "Failed" ? "destructive" : "secondary"}>
                {row.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right tabular-nums">$750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

/** Loading rows keep the column widths, so the table does not jump when data lands. */
export const Loading: Story = {
  render: () => (
    <Table className="w-[36rem]">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[0, 1, 2].map((row) => (
          <TableRow key={row}>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell className="flex justify-end"><Skeleton className="h-4 w-16" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

/** The state that is usually missing: a table with nothing in it still needs to say so. */
export const Empty: Story = {
  render: () => (
    <Table className="w-[36rem]">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
            No invoices yet. They appear here once a customer is billed.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
