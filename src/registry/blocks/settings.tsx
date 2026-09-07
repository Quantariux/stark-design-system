"use client"

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
  FormError,
  FormField,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToastProvider, Toaster, useToast } from "@/components/ui/toast"

/*
 * Settings: categories across the top, one form per category.
 *
 * Content guidance — group by what someone came to change, not by what the data model
 * looks like. If a tab needs a scrollbar it is two tabs.
 *
 * The save path is the part worth copying. A settings screen that changes something and
 * says nothing is the most common unfinished screen in any product: the user cannot tell
 * whether it worked, so they press save again. Every submit here ends in a toast, and
 * failures report beside the field that failed rather than only in the toast, so the
 * message is next to the thing to fix.
 */

function ProfileForm() {
  const toast = useToast()

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault()
        toast.add({ title: "Profile saved", description: "Your changes are live." })
      }}
    >
      <FormField name="name">
        <FormLabel>Display name</FormLabel>
        <FormControl render={<Input placeholder="Ada Lovelace" />} />
        <FormDescription>Shown next to anything you publish.</FormDescription>
      </FormField>

      <FormField
        name="email"
        validate={(value) =>
          String(value).includes("@") ? null : "Enter a valid email address."
        }
      >
        <FormLabel>Email</FormLabel>
        <FormControl render={<Input type="email" placeholder="you@example.com" />} />
        <FormError />
      </FormField>

      <FormField name="bio">
        <FormLabel>Bio</FormLabel>
        <FormControl render={<Textarea placeholder="A short introduction" />} />
        <FormDescription>Fewer than 200 characters.</FormDescription>
      </FormField>

      <Button type="submit" className="self-start">
        Save changes
      </Button>
    </Form>
  )
}

function NotificationRow({
  id,
  title,
  description,
  defaultChecked,
}: {
  id: string
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor={id}>{title}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  )
}

export function SettingsBlock() {
  return (
    <ToastProvider>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl leading-tight font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and how you are notified.
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>How you appear to other people.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what reaches you, and where.</CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                <NotificationRow
                  id="notify-releases"
                  title="Release notes"
                  description="When a new version ships."
                  defaultChecked
                />
                <NotificationRow
                  id="notify-mentions"
                  title="Mentions"
                  description="When someone mentions you in a comment."
                  defaultChecked
                />
                <NotificationRow
                  id="notify-digest"
                  title="Weekly digest"
                  description="A summary every Monday morning."
                />
              </CardContent>
              <Separator />
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Changes take effect immediately.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </ToastProvider>
  )
}
