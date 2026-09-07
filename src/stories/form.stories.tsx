import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  Form,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormFieldset,
  FormLabel,
  FormLegend,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const meta = {
  title: "UI/Form",
  component: Form,
  tags: ["autodocs"],
} satisfies Meta<typeof Form>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The wiring is the point: the label points at the control, and the description is in the
 * control's aria-describedby. Nothing here sets an id by hand.
 */
export const Default: Story = {
  render: () => (
    <Form className="w-96">
      <FormField name="email">
        <FormLabel>Email</FormLabel>
        <FormControl render={<Input type="email" placeholder="you@example.com" />} />
        <FormDescription>We only use this for release notes.</FormDescription>
      </FormField>
      <Button type="submit" className="self-start">Save</Button>
    </Form>
  ),
}

/**
 * A failing field. The error is announced through the same aria-describedby, and the
 * control carries aria-invalid — so it is not only red, it is reported as invalid.
 */
export const WithValidation: Story = {
  render: () => (
    <Form className="w-96">
      <FormField
        name="username"
        validate={(value) =>
          String(value).length < 3 ? "Use at least 3 characters." : null
        }
      >
        <FormLabel>Username</FormLabel>
        <FormControl render={<Input placeholder="ada" />} />
        <FormDescription>Shown on your public profile.</FormDescription>
        <FormError />
      </FormField>
      <Button type="submit" className="self-start">Create</Button>
    </Form>
  ),
}

/** Grouped fields. The legend names the group, so it is announced before its members. */
export const Grouped: Story = {
  render: () => (
    <Form className="w-96">
      <FormFieldset>
        <FormLegend>Profile</FormLegend>
        <FormField name="name">
          <FormLabel>Display name</FormLabel>
          <FormControl render={<Input placeholder="Ada Lovelace" />} />
        </FormField>
        <FormField name="bio">
          <FormLabel>Bio</FormLabel>
          <FormControl render={<Textarea placeholder="A short introduction" />} />
          <FormDescription>Fewer than 200 characters.</FormDescription>
        </FormField>
      </FormFieldset>
      <Button type="submit" className="self-start">Save profile</Button>
    </Form>
  ),
}
