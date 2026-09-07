"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

/*
 * Onboarding: a few short steps with visible progress.
 *
 * Content guidance — three or four steps, one decision each. The point of splitting a form
 * into steps is to make it feel short; six steps makes it feel long, which is the opposite
 * of the reason for doing it.
 *
 * Progress is stated twice on purpose: the bar for the glance, the "Step 2 of 3" for the
 * fact. A bar alone tells someone they are part-way through something of unknown length,
 * which is why abandonment goes up when the count is missing.
 *
 * Back is always available. A step someone cannot reverse is a trap, and it is the reason
 * people abandon rather than correct a mistake.
 */

const steps = [
  { title: "Your account", description: "How we address you." },
  { title: "Your workspace", description: "Where your work lives." },
  { title: "Finish", description: "Confirm and get started." },
]

export function OnboardingBlock() {
  const [step, setStep] = React.useState(0)
  const last = step === steps.length - 1
  const current = steps[step]

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 p-6">
      <Progress value={((step + 1) / steps.length) * 100}>
        <div className="flex items-center justify-between">
          <ProgressLabel>
            Step {step + 1} of {steps.length}
          </ProgressLabel>
          <ProgressValue />
        </div>
      </Progress>

      <Card>
        <CardHeader>
          <CardTitle>{current.title}</CardTitle>
          <CardDescription>{current.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {step === 0 && (
            <Form>
              <FormField name="name">
                <FormLabel>Full name</FormLabel>
                <FormControl render={<Input placeholder="Ada Lovelace" />} />
              </FormField>
              <FormField name="email">
                <FormLabel>Email</FormLabel>
                <FormControl render={<Input type="email" placeholder="you@example.com" />} />
                <FormDescription>Used for sign-in and release notes.</FormDescription>
              </FormField>
            </Form>
          )}

          {step === 1 && (
            <Form>
              <FormField name="workspace">
                <FormLabel>Workspace name</FormLabel>
                <FormControl render={<Input placeholder="Acme" />} />
                <FormDescription>You can rename this later.</FormDescription>
              </FormField>
              <FormField name="purpose">
                <FormLabel>What will you build?</FormLabel>
                <FormControl render={<Textarea placeholder="A short description" />} />
              </FormField>
            </Form>
          )}

          {step === 2 && (
            <div className="flex flex-col items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckIcon className="size-4" />
              </span>
              <p className="text-sm text-muted-foreground">
                That is everything. You can change any of it in Settings.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-between gap-2">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            Back
          </Button>
          <Button
            onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
            disabled={last}
          >
            {last ? "Done" : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
