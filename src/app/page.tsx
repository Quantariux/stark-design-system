import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

/*
 * The front door: what the system contains, and where to look at it.
 *
 * This replaced the create-next-app scaffold, which used hardcoded zinc colours and so was
 * the one page in the repository that could not show whether the tokens worked.
 */

const patterns = [
  { href: "/patterns/dashboard", title: "Dashboard", description: "Metrics above, detail below." },
  { href: "/patterns/settings", title: "Settings", description: "Categories, forms, and a save that reports." },
  { href: "/patterns/detail", title: "Detail", description: "One thing, described fully." },
  { href: "/patterns/onboarding", title: "Onboarding", description: "Short steps with visible progress." },
  { href: "/patterns/search", title: "Search", description: "Filter, results, and the empty state." },
]

const swatches = [
  "background", "foreground", "primary", "secondary",
  "muted", "accent", "destructive", "border",
]

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 p-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight">
            Stark Design System
          </h1>
          <Badge variant="secondary">Base UI</Badge>
        </div>
        <p className="max-w-prose text-muted-foreground">
          26 components and 5 page blocks, distributed through a shadcn-compatible registry.
          Tokens are the single source for both the app stylesheet and the registry theme.
        </p>
        {/*
          Links, styled as buttons -- not Buttons rendering links.

          Base UI's Button assumes a native <button>, and rendering an anchor through it
          strips those semantics. More to the point these navigate, so they should be real
          anchors: middle-click, open-in-new-tab and copy-link all work on an <a> and none
          of them work on a button. This is the same pattern pagination.tsx uses.
        */}
        <div className="flex flex-wrap gap-2">
          <Link href="/patterns/dashboard" className={buttonVariants()}>
            Browse patterns
          </Link>
          <a href="/registry/registry.json" className={buttonVariants({ variant: "outline" })}>
            Registry index
          </a>
        </div>
      </header>

      <Separator />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg leading-snug font-medium">Page blocks</h2>
          <p className="text-sm text-muted-foreground">
            Each one is composed from the components — none of them hand-write markup.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {patterns.map((pattern) => (
            <Link key={pattern.href} href={pattern.href} className="group">
              <Card
                size="sm"
                className="transition-colors group-hover:bg-muted/50"
              >
                <CardHeader>
                  <CardTitle>{pattern.title}</CardTitle>
                  <CardDescription>{pattern.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg leading-snug font-medium">Tokens</h2>
          <p className="text-sm text-muted-foreground">
            Semantic colour roles. If these render as flat grey, the token pipeline is
            broken — which is exactly the bug this page now makes visible.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {swatches.map((name) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div
                className="h-12 rounded-md ring-1 ring-foreground/10"
                style={{ background: `var(--${name})` }}
              />
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg leading-snug font-medium">Scales</h2>
        <Card>
          <CardContent className="flex flex-col gap-5 pt-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Spacing</span>
              <div className="flex items-end gap-2">
                {["1", "2", "3", "4", "6", "8", "12"].map((step) => (
                  <div key={step} className="flex flex-col items-center gap-1">
                    <div
                      className="bg-primary"
                      style={{ width: `var(--spacing-${step})`, height: `var(--spacing-${step})` }}
                    />
                    <span className="text-xs text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Radius</span>
              <div className="flex items-center gap-3">
                {["sm", "md", "lg", "xl"].map((step) => (
                  <div key={step} className="flex flex-col items-center gap-1">
                    <div
                      className="size-10 bg-secondary ring-1 ring-foreground/10"
                      style={{ borderRadius: `var(--radius-${step})` }}
                    />
                    <span className="text-xs text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Type</span>
              <div className="flex flex-wrap items-baseline gap-4">
                {["sm", "base", "lg", "xl", "2xl"].map((step) => (
                  <span key={step} style={{ fontSize: `var(--text-${step})` }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
