import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateGuardian, deleteGuardian } from "../../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Label } from "@/components/ui/Field";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { SubmitButton } from "@/components/ui/SubmitButton";

export const dynamic = "force-dynamic";

export default async function GuardianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: guardian } = await supabase
    .from("guardians")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!guardian) notFound();

  const updateWithId = updateGuardian.bind(null, guardian.id);
  const deleteWithId = deleteGuardian.bind(null, guardian.id);

  return (
    <div>
      <PageHeader title={`${guardian.first_name} ${guardian.last_name}`} />

      <Card className="p-4">
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" name="first_name" defaultValue={guardian.first_name} required />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" name="last_name" defaultValue={guardian.last_name} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={guardian.email ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={guardian.phone ?? ""} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                name="relationship"
                defaultValue={guardian.relationship ?? ""}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={guardian.notes ?? ""} />
          </div>
          <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
        </form>
      </Card>

      <form action={deleteWithId} className="mt-4">
        <ConfirmButton confirmMessage="Delete this guardian record? Campers linked to them will keep their record but lose the link.">
          Delete guardian
        </ConfirmButton>
      </form>
    </div>
  );
}
