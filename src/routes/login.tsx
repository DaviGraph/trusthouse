import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminToken, setAdminToken } from "@/lib/admin-session";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminLoginServer } from "@/lib/server/admin-auth";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      setIsAdminAuthed(true);
    } else {
      setIsAdminAuthed(false);
    }
  }, []);

  if (isPending || isAdminAuthed === null) {
    return <div className="min-h-dvh bg-bg" />;
  }

  if (isAdminAuthed) {
    return <Navigate to="/admin" />;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const cleanEmail = email.trim();

    try {
      // 1. First try Admin authentication based on credentials
      try {
        const adminRes = await adminLoginServer({
          data: { email: cleanEmail, password },
        });
        if (adminRes && adminRes.token) {
          setAdminToken(adminRes.token);
          window.location.href = "/admin";
          return;
        }
      } catch {
        // Not an admin credential or admin auth failed, proceed to normal agent authentication
      }

      // 2. Normal agent user authentication
      if (authEnabled) {
        const { error: err } = await authClient.signIn.email({
          email: cleanEmail,
          password,
          callbackURL: "/dashboard",
        });
        if (err) {
          setError(err.message ?? "Could not sign in. Please check your credentials.");
          return;
        }
        window.location.href = "/dashboard";
      } else {
        setError("Sign-in is currently disabled.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-card sm:p-8">
        <BrandMark />
        <h1 className="mt-6 font-display text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Access your agent dashboard or admin control panel.
        </p>

        {authEnabled ? (
          <>
            <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" disabled={busy} size="lg">
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <div className="relative my-6">
              <div className="h-px bg-border" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 text-xs text-faint">
                or
              </span>
            </div>
            <div className="grid gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  onClick={() => signIn(p.providerId, { callbackURL: "/dashboard" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
        )}

        <p className="mt-6 text-sm text-muted">
          New agent?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-sm">
          <Link to="/" className="text-muted hover:text-fg">
            Back home
          </Link>
        </p>
      </div>
    </main>
  );
}
