import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBooking, deleteBooking } from "../../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea, Label } from "@/components/ui/Field";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { BOOKING_STATUS_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!booking) notFound();

  const updateWithId = updateBooking.bind(null, booking.id);
  const deleteWithId = deleteBooking.bind(null, booking.id);

  return (
    <div>
      <PageHeader title={booking.group_name} />

      <Card className="p-4">
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="group_name">Group name</Label>
              <Input
                id="group_name"
                name="group_name"
                defaultValue={booking.group_name}
                required
              />
            </div>
            <div>
              <Label htmlFor="start_date">Arrives</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={booking.start_date ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Departs</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={booking.end_date ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="headcount">Headcount</Label>
              <Input
                id="headcount"
                name="headcount"
                type="number"
                min={1}
                max={200}
                defaultValue={booking.headcount ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={booking.status}>
                {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="contact_name">Contact</Label>
              <Input
                id="contact_name"
                name="contact_name"
                defaultValue={booking.contact_name ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact phone</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                defaultValue={booking.contact_phone ?? ""}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="contact_email">Contact email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={booking.contact_email ?? ""}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={booking.notes ?? ""} />
          </div>
          <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
        </form>
      </Card>

      <form action={deleteWithId} className="mt-4">
        <ConfirmButton confirmMessage="Delete this group booking? This can't be undone.">
          Delete booking
        </ConfirmButton>
      </form>
    </div>
  );
}
