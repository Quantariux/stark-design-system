import {
  ActivityIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CreditCardIcon,
  DollarSignIcon,
  UsersIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/*
 * Dashboard: metrics above, detail below.
 *
 * Content guidance — four metrics at most. A dashboard's job is to be readable at a
 * glance, and a fifth tile pushes the row to wrap on a laptop, at which point nothing is
 * glanceable. Anything further down belongs in the table.
 *
 * Responsive — the metric row is 1 / 2 / 4 columns. It never goes to 3: an odd column
 * count leaves a hole in the second row that reads as a missing tile.
 */

/*
 * Direction and sentiment are two different things, and a metric tile that conflates them
 * is wrong about half its content: support tickets rising is not good news rendered green.
 * `direction` picks the arrow, `good` picks the colour, and the two disagree on purpose in
 * the third tile below.
 */
const metrics = [
  {
    label: "Monthly revenue",
    value: "$128,940",
    change: "+12.4%",
    direction: "up",
    good: true,
    icon: DollarSignIcon,
  },
  {
    label: "Active teams",
    value: "1,204",
    change: "+4.1%",
    direction: "up",
    good: true,
    icon: UsersIcon,
  },
  {
    label: "Failed payments",
    value: "38",
    change: "+9",
    direction: "up",
    good: false,
    icon: CreditCardIcon,
  },
  {
    label: "Median response",
    value: "412ms",
    change: "-38ms",
    direction: "down",
    good: true,
    icon: ActivityIcon,
  },
] as const

/*
 * Four statuses, not two. A table that only distinguishes "failed" from "everything else"
 * pushes success, in-flight and reversed into one grey pill, which is the state most
 * status columns ship in.
 */
const statusVariant = {
  Paid: "success",
  Pending: "warning",
  Failed: "destructive",
  Refunded: "secondary",
} as const

const rows = [
  { id: "INV-3041", customer: "Ada Lovelace", status: "Paid", amount: "$250.00" },
  { id: "INV-3042", customer: "Alan Turing", status: "Pending", amount: "$150.00" },
  { id: "INV-3043", customer: "Grace Hopper", status: "Refunded", amount: "$350.00" },
  { id: "INV-3044", customer: "Katherine Johnson", status: "Failed", amount: "$450.00" },
] as const

export function DashboardBlock() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Last 30 days, compared with the period before.
          </p>
        </div>
        <Button>Download report</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, change, direction, good, icon: Icon }) => {
          const Trend = direction === "up" ? ArrowUpRightIcon : ArrowDownRightIcon
          return (
            <Card key={label} size="sm">
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardAction>
                  <Icon className="size-4 text-muted-foreground" />
                </CardAction>
                {/* The number is the tile. At text-xl it carried the same weight as its
                    own label, which is the difference between a metric and a list item. */}
                <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-1 text-xs">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-medium tabular-nums",
                      good ? "text-success" : "text-destructive"
                    )}
                  >
                    {/* Decorative: the sign in `change` already states the direction, so
                        announcing the arrow would read the same fact twice. */}
                    <Trend className="size-3.5" aria-hidden />
                    {change}
                  </span>
                  <span className="text-muted-foreground">from last period</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
          <CardDescription>The four most recent, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
                    <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
