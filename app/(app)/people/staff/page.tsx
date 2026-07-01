import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createStaff } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Textarea, Label } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .order("last_name", { ascending: true });

  return (
    <div>
      <PageHeader title="Staff" description="Basic records for your camp staff." />

      <Card className="p-4 mb-6">
        <form action={createStaff} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" name="first_name" required />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" name="last_name" required />
            </div>
            <div className="col-span-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="Counselor, Lifeguard, Nurse..." />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <SubmitButton pendingText="Saving..." className="w-full sm:w-auto">
            Add staff member
          </SubmitButton>
        </form>
      </Card>

      <Card className="px-3">
        {staff && staff.length > 0 ? (
          <div className="divide-y divide-border">
            {staff.map((member) => (
              <Link
                key={member.id}
                href={`/people/staff/${member.id}`}
                className="flex items-center justify-between gap-3 py-3 px-1"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-muted truncate">
                    {[member.role, member.phone, member.email].filter(Boolean).join(" · ") ||
                      "No details on file"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6">
            <EmptyState title="No staff yet" description="Add your first staff member above." />
          </div>
        )}
      </Card>
    </div>
  );
}
