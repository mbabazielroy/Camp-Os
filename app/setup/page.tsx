import { Card } from "@/components/ui/Card";
import { BrandMark } from "@/components/Brand";
import { isGoogleConfigured, isOpenAIConfigured, isSupabaseConfigured } from "@/lib/env";
import { Check, X, CircleDashed } from "lucide-react";

// Reads the environment on each request so a restart with new values shows up.
export const dynamic = "force-dynamic";

function StatusRow({
  label,
  state,
  note,
}: {
  label: string;
  state: "ok" | "missing" | "optional";
  note: string;
}) {
  const icon =
    state === "ok" ? (
      <Check size={15} />
    ) : state === "missing" ? (
      <X size={15} />
    ) : (
      <CircleDashed size={15} />
    );
  const chip =
    state === "ok"
      ? "bg-primary-soft text-primary"
      : state === "missing"
        ? "bg-danger-soft text-danger"
        : "bg-surface-muted text-muted";

  return (
    <div className="flex items-start gap-3 py-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${chip}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-sm text-foreground break-all">{label}</p>
        <p className="text-sm text-muted mt-0.5">{note}</p>
      </div>
    </div>
  );
}

export default function SetupPage() {
  const supabaseReady = isSupabaseConfigured();
  const openaiReady = isOpenAIConfigured();
  const googleReady = isGoogleConfigured();

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <BrandMark size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Finish setting up
            </h1>
            <p className="text-sm text-muted mt-0.5">
              The app needs a database and an AI key before it can run.
            </p>
          </div>
        </div>

        <Card className="px-4 mb-6">
          <div className="divide-y divide-border">
            <StatusRow
              label="NEXT_PUBLIC_SUPABASE_URL"
              state={supabaseReady ? "ok" : "missing"}
              note={
                supabaseReady
                  ? "Found."
                  : "Required. Your Supabase project's API URL."
              }
            />
            <StatusRow
              label="NEXT_PUBLIC_SUPABASE_ANON_KEY"
              state={supabaseReady ? "ok" : "missing"}
              note={
                supabaseReady
                  ? "Found."
                  : "Required. The publishable anon key from the same page."
              }
            />
            <StatusRow
              label="OPENAI_API_KEY"
              state={openaiReady ? "ok" : "optional"}
              note={
                openaiReady
                  ? "Found."
                  : "Needed for email triage and draft replies. The rest of the app works without it."
              }
            />
            <StatusRow
              label="GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET"
              state={googleReady ? "ok" : "optional"}
              note={
                googleReady
                  ? "Found."
                  : "Optional. Only needed to sync Gmail and save replies as Gmail drafts."
              }
            />
          </div>
        </Card>

        <Card className="p-5 mb-6">
          <h2 className="font-semibold text-foreground mb-3">How to fix this</h2>
          <ol className="space-y-4 text-sm text-muted">
            <li>
              <p className="text-foreground font-medium">1. Create a Supabase project</p>
              <p className="mt-1">
                Go to{" "}
                <a
                  href="https://supabase.com/dashboard"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  supabase.com/dashboard
                </a>
                , create a free project, then open <em>Project Settings → API</em> and copy
                the Project URL and the anon/publishable key.
              </p>
            </li>
            <li>
              <p className="text-foreground font-medium">2. Create the database tables</p>
              <p className="mt-1">
                In the Supabase <em>SQL Editor</em>, paste the contents of{" "}
                <code className="font-mono text-xs text-primary">supabase/schema.sql</code>{" "}
                from this project and run it once.
              </p>
            </li>
            <li>
              <p className="text-foreground font-medium">
                3. Add a <code className="font-mono text-xs">.env.local</code> file
              </p>
              <p className="mt-1">
                In the project root (next to <code className="font-mono text-xs">package.json</code>
                ), create a file named <code className="font-mono text-xs">.env.local</code>{" "}
                containing:
              </p>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-surface-muted p-3 font-mono text-xs text-foreground">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
OPENAI_API_KEY=sk-...`}
              </pre>
            </li>
            <li>
              <p className="text-foreground font-medium">4. Restart the dev server</p>
              <p className="mt-1">
                Stop it with <code className="font-mono text-xs">Ctrl+C</code> and run{" "}
                <code className="font-mono text-xs">npm run dev</code> again - environment
                files are only read at startup. Then reload this page.
              </p>
            </li>
          </ol>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-foreground mb-2">
            Using a cloud dev environment?
          </h2>
          <p className="text-sm text-muted">
            In GitHub Codespaces, a <code className="font-mono text-xs">.env.local</code>{" "}
            file works the same way. To reach this page from a phone, open the{" "}
            <strong className="text-foreground">PORTS</strong> tab, right-click port{" "}
            <strong className="text-foreground">3000</strong> and set{" "}
            <em>Port Visibility</em> to <strong className="text-foreground">Public</strong> -
            otherwise the phone only gets a GitHub login page. Run{" "}
            <code className="font-mono text-xs">npm run phone</code> for the address and a QR
            code.
          </p>
        </Card>

        {supabaseReady && (
          <p className="mt-6 text-center text-sm text-muted">
            Supabase looks configured.{" "}
            <a href="/dashboard" className="text-primary font-medium hover:underline">
              Go to the app
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
