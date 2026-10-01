import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureAgentProfile } from "@/lib/server/agents";
import { sendWelcomeEmail } from "@/lib/server/email";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const { user, isPending } = useCurrentUserState();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) return <div className="min-h-dvh bg-bg" />;
  if (user) return <Navigate to="/dashboard" />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard",
      });
      if (err) {
        setError(err.message ?? "Could not create account.");
        return;
      }
      try {
        await ensureAgentProfile({ data: { displayName: name, phone, bio } });
      } catch {
        /* profile is created on first dashboard visit if this races */
      }
      // Send welcome email via Resend API
      try {
        void sendWelcomeEmail(email, name);
      } catch {
        /* non-blocking email trigger */
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-card sm:p-8">
        <BrandMark />
        <h1 className="mt-6 font-display text-2xl font-semibold">Create your agent account</h1>
        <p className="mt-1 text-sm text-muted">
          You get a dashboard and a public page at trusthouse.com/your-name.
        </p>

        {authEnabled ? (
          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                autoComplete="name"
                placeholder="Adeola Okonkwo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0803 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bio">About you or your company</Label>
              <textarea
                id="bio"
                rows={3}
                placeholder="e.g. Independent agent covering Lekki and Ikoyi, 5 years in the market."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted">Buyers see this on your public page.</p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted">At least 8 characters.</p>
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" disabled={busy} size="lg">
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-muted">Sign-up is disabled.</p>
        )}

        <p className="mt-6 text-sm text-muted">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}