import Link from "next/link";
import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const redirectTo = params.redirectTo ?? "/dashboard";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white text-xl font-semibold">
            C
          </div>
          <h1 className="text-2xl font-semibold text-foreground">CampFlow Admin</h1>
          <p className="text-sm text-muted mt-1">
            Less time on email, more time with campers.
          </p>
        </div>

        <Card className="p-6">
          {params.notice && (
            <p className="mb-4 rounded-lg bg-primary-soft text-primary text-sm px-3 py-2">
              {params.notice}
            </p>
          )}
          {params.error && (
            <p className="mb-4 rounded-lg bg-danger-soft text-danger text-sm px-3 py-2">
              {params.error}
            </p>
          )}

          {mode === "signin" ? (
            <form action={signIn} className="space-y-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          ) : (
            <form action={signUp} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Your name</Label>
                <Input id="fullName" name="fullName" autoComplete="name" required />
              </div>
              <div>
                <Label htmlFor="campName">Camp name</Label>
                <Input id="campName" name="campName" autoComplete="organization" />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted mt-5">
          {mode === "signin" ? (
            <>
              New to CampFlow?{" "}
              <Link href="/login?mode=signup" className="text-primary font-medium">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login?mode=signin" className="text-primary font-medium">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
