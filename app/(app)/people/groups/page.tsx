import Link from "next/link";
import { requireCamp } from "@/lib/auth";
import { createBooking } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select, Textarea, Label } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SearchBox } from "@/components/people/SearchBox";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES } from "@/lib/labels";
import { formatDateRange } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { supabase, campId } = await requireCamp();

  let query = supabase
    .from("bookings")
    .select("*")
    .eq("camp_id", campId)
    .order("start_date", { ascending: true, nullsFirst: false });

  if (q?.trim()) {
    const term = q.trim().replaceAll("%", "").replaceAll(",", "");
    query = query.or(`group_name.ilike.%${term}%,contact_name.ilike.%${term}%`);
  }

  const { data: bookings } = await query;

  return (
    <div>
      <PageHeader
        title="Retreat groups"
        description="Group bookings and rentals - the camp's year-round work between summer sessions."
      />

      <Card className="p-4 mb-6">
        <form action={createBooking} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="group_name">Group name</Label>
              <Input
                id="group_name"
                name="group_name"
                placeholder="Grace Fellowship youth retreat"
                required
              />
            </div>
            <div>
              <Label htmlFor="start_date">Arrives</Label>
              <Input id="start_date" name="start_date" type="date" />
            </div>
            <div>
              <Label htmlFor="end_date">Departs</Label>
              <Input id="end_date" name="end_date" type="date" />
            </div>
            <div>
              <Label htmlFor="headcount">Headcount</Label>
              <Input id="headcount" name="headcount" type="number" min={1} max={200} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue="inquiry">
                {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="contact_name">Contact</Label>
              <Input id="contact_name" name="contact_name" />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact email</Label>
              <Input id="contact_email" name="contact_email" type="email" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} placeholder="Meals, rooms, AV needs" />
          </div>
          <SubmitButton pendingText="Saving..." className="w-full sm:w-auto">
            Add group
          </SubmitButton>
        </form>
      </Card>

      <SearchBox placeholder="Search groups or contacts..." defaultValue={q} />

      <Card className="px-3">
        {bookings && bookings.length > 0 ? (
          <div className="divide-y divide-border">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/people/groups/${booking.id}`}
                className="flex items-center justify-between gap-3 py-3 px-1"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{booking.group_name}</p>
                  <p className="text-sm text-muted truncate">
                    {[
                      formatDateRange(booking.start_date, booking.end_date),
                      booking.headcount ? `${booking.headcount} people` : null,
                      booking.contact_name,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No dates yet"}
                  </p>
                </div>
                <Badge className={`${BOOKING_STATUS_STYLES[booking.status]} shrink-0`}>
                  {BOOKING_STATUS_LABELS[booking.status]}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6">
            <EmptyState
              title={q ? "No groups match your search" : "No groups booked yet"}
              description={
                q
                  ? "Try a different name."
                  : "Add a retreat or rental enquiry above to keep track of it."
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
