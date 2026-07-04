import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopBar } from "@/components/nav/TopBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("camp_id")
    .eq("id", user.id)
    .maybeSingle();

  let campName: string | null = null;
  if (profile?.camp_id) {
    const { data: camp } = await supabase
      .from("camps")
      .select("name")
      .eq("id", profile.camp_id)
      .maybeSingle();
    campName = camp?.name ?? null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar campName={campName} email={user.email ?? null} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar campName={campName} />
        <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-28 md:pb-8 max-w-3xl w-full mx-auto md:mx-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
