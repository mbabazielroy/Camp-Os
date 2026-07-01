import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCamper, deleteCamper } from "../../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";

export const dynamic = "force-dynamic";

export default async function CamperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: camper }, { data: guardians }] = await Promise.all([
    supabase.from("campers").select("*").eq("id", id).maybeSingle(),
    supabase.from("guardians").select("id, first_name, last_name").order("last_name"),
  ]);

  if (!camper) notFound();

  const updateWithId = updateCamper.bind(null, camper.id);
  const deleteWithId = deleteCamper.bind(null, camper.id);

  return (
    <div>
      <PageHeader title={`${camper.first_name} ${camper.last_name}`} />

      <Card className="p-4">
        <form action={updateWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" name="first_name" defaultValue={camper.first_name} required />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" name="last_name" defaultValue={camper.last_name} required />
            </div>
            <div>
              <Label htmlFor="cabin">Cabin</Label>
              <Input id="cabin" name="cabin" defaultValue={camper.cabin ?? ""} />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={0}
                max={99}
                defaultValue={camper.age ?? ""}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="guardian_id">Guardian</Label>
              <Select id="guardian_id" name="guardian_id" defaultValue={camper.guardian_id ?? ""}>
                <option value="">None linked</option>
                {(guardians ?? []).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.first_name} {g.last_name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={camper.notes ?? ""} />
          </div>
          <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
        </form>
      </Card>

      <form action={deleteWithId} className="mt-4">
        <Button type="submit" variant="danger" size="sm">
          Delete camper
        </Button>
      </form>
    </div>
  );
}
