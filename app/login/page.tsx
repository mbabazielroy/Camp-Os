import Link from "next/link";
import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { BrandMark } from "@/components/Brand";
import { Waves, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";
  const redirectTo = params.redirectTo ?? "/dashboard";

  return (
    <div className="flex-1 flex min-h-screen">
      {/* Brand panel (desktop) */}
      <div className="hidden lg:flex lg:w-[44%] bg-stream text-white flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10" aria-hidden />
        <div className="absolute right-10 top-40 h-32 w-32 rounded-full bg-white/10" aria-hidden />
        <svg
          className="absolute bottom-0 inset-x-0 w-full text-white/10"
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0 35 Q 50 15, 100 35 T 200 35 T 300 35 T 400 35 V 60 H 0 Z" fill="currentColor" />
          <path d="M0 47 Q 50 30, 100 47 T 200 47 T 300 47 T 400 47 V 60 H 0 Z" fill="currentColor" />
        </svg>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Waves size={20} />
          </div>
          <div>
            <p className="font-semibold leading-tight tracking-tight">Mill Stream</p>
            <p className="text-xs text-white/70 leading-tight">Camp office</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight leading-snug">
            Less time at the desk.
            <br />
            More time at the waterfront.
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-white/85">
            <li className="flex items-start gap-2.5">
              <Sparkles size={17} className="mt-0.5 shrink-0" />
              AI triages parent emails and drafts warm, accurate replies from your camp&apos;s own policies.
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={17} className="mt-0.5 shrink-0" />
              Approved replies land in your Gmail drafts - you always press send.
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck size={17} className="mt-0.5 shrink-0" />
              Nothing ever goes out without a human&apos;s okay.
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          Built for Mill Stream Bible Camp &amp; Retreat Centre
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto lg:mx-0 mb-3 w-fit">
              <BrandMark size="lg" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
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
                  <Input
                    id="campName"
                    name="campName"
                    autoComplete="organization"
                    placeholder="Mill Stream Bible Camp"
                  />
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
                New here?{" "}
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
    </div>
  );
}
