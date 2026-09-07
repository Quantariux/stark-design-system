import {
  ActivityIcon,
  CreditCardIcon,
  DollarSignIcon,
  UsersIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const metrics = [
  { label: "Revenue", value: "$45,231.89", change: "+20.1%", icon: DollarSignIcon },
  { label: "Subscriptions", value: "2,350", change: "+180.1%", icon: UsersIcon },
  { label: "Sales", value: "12,234", change: "+19%", icon: CreditCardIcon },
  { label: "Active now", value: "573", change: "+201", icon: ActivityIcon },
]

const rows = [
  { id: "INV-001", customer: "Ada Lovelace", status: "Paid", amount: "$250.00" },
  { id: "INV-002", customer: "Alan Turing", status: "Pending", amount: "$150.00" },
  { id: "INV-003", customer: "Grace Hopper", status: "Paid", amount: "$350.00" },
  { id: "INV-004", customer: "Katherine Johnson", status: "Failed", amount: "$450.00" },
]

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
        {metrics.map(({ label, value, change, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardAction>
                <Icon className="size-4 text-muted-foreground" />
              </CardAction>
              <CardTitle className="text-xl tabular-nums">{value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{change} from last period</p>
            </CardContent>
          </Card>
        ))}
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
                    <Badge variant={row.status === "Failed" ? "destructive" : "secondary"}>
                      {row.status}
                    </Badge>
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
