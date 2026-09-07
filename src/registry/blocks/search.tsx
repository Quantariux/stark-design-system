"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStatus,
} from "@/components/ui/command"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"

/*
 * Search: a filter, results, and the state where there are none.
 *
 * The empty state is the reason this block exists. It is the single most-skipped screen in
 * any design system — everyone builds the list, nobody builds what happens when the list
 * is empty, and the result ships as a blank panel that looks broken. Here it says what was
 * searched for and what to do next, and CommandStatus announces the result count so the
 * outcome is not purely visual.
 *
 * Content guidance — say how many results, always. "Showing 8 of 240" tells someone whether
 * to refine or to page; "Results" tells them nothing.
 */

const catalogue = [
  { title: "Button", group: "Component", description: "Actions and links." },
  { title: "Dialog", group: "Component", description: "A focused, blocking task." },
  { title: "Command", group: "Component", description: "Filterable list of options." },
  { title: "Dashboard", group: "Pattern", description: "Metrics above, detail below." },
  { title: "Settings", group: "Pattern", description: "Categories and forms." },
  { title: "Spacing", group: "Token", description: "A 4px base scale." },
  { title: "Radius", group: "Token", description: "Four steps, sm to xl." },
  { title: "Motion", group: "Token", description: "Durations and easings." },
]

export function SearchBlock() {
  const [query, setQuery] = React.useState("")

  const results = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return catalogue
    return catalogue.filter(
      (entry) =>
        entry.title.toLowerCase().includes(needle) ||
        entry.description.toLowerCase().includes(needle)
    )
  }, [query])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">
          Components, patterns and tokens in the system.
        </p>
      </div>

      <Command items={results.map((entry) => entry.title)}>
        <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
          <CommandInput
            placeholder="Search the system..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {/*
            Outside the list, not inside it. CommandList renders role="listbox", and a
            listbox may only contain options — an empty-state message inside it fails
            aria-required-children, which is a real violation rather than a lint nit: the
            role promises children the element does not have.
          */}
          <CommandEmpty>
            <p className="font-medium text-foreground">No matches</p>
            <p className="mt-1">
              Nothing matches “{query}”. Try a shorter word, or clear the filter.
            </p>
          </CommandEmpty>
          <CommandList>
            {results.map((entry) => (
              <CommandItem key={entry.title} value={entry.title}>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="font-medium">{entry.title}</span>
                    <span className="ml-2 text-muted-foreground">{entry.description}</span>
                  </span>
                  <Badge variant="secondary">{entry.group}</Badge>
                </div>
              </CommandItem>
            ))}
          </CommandList>
          <CommandStatus />
        </div>
      </Command>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {results.length} of {catalogue.length}
      </p>

      <Separator />

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">9</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
