import { CalendarIcon, GitBranchIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/*
 * Detail: one thing, described fully.
 *
 * Content guidance — the title says what it is, the badge says what state it is in, and
 * the metadata row answers who and when. Everything else goes below the fold in tabs.
 *
 * The status badge sits beside the title, not in the metadata row, because state is the
 * second thing anyone needs after identity — and a status buried among five other
 * attributes is a status nobody reads.
 */

const metadata = [
  { icon: UserIcon, label: "Owner", value: "Ada Lovelace" },
  { icon: CalendarIcon, label: "Updated", value: "2 hours ago" },
  { icon: GitBranchIcon, label: "Branch", value: "stark/registry-fix" },
]

export function DetailBlock() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Stark</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Registry correctness</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl leading-tight font-semibold tracking-tight">
              Registry correctness
            </h1>
            <Badge>In review</Badge>
          </div>
          <p className="max-w-prose text-sm text-muted-foreground">
            Derive registry dependencies from imports so an installed component compiles in
            the project it lands in.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Share</Button>
          <Button>Approve</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {metadata.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <Icon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      <Separator />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>What changed, and why.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p>
                Registry items declared only one of their three imports, so every installed
                component failed to compile in the consuming project.
              </p>
              <p className="text-muted-foreground">
                Dependencies are now derived from each file&apos;s imports rather than a
                hand-written list, and a check fails the build if any are missing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              {[
                { who: "Ada Lovelace", what: "opened this for review", when: "2 hours ago" },
                { who: "Alan Turing", what: "left a comment", when: "1 hour ago" },
              ].map((entry) => (
                <div key={entry.who} className="flex items-start gap-3">
                  <Avatar className="size-7">
                    <AvatarFallback>
                      {entry.who.split(" ").map((part) => part[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm">
                    <span className="font-medium">{entry.who}</span>{" "}
                    <span className="text-muted-foreground">{entry.what}</span>{" "}
                    <span className="text-muted-foreground">· {entry.when}</span>
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
