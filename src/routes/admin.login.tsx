import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, LogIn, Mail, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/admin-session";
import { adminLoginServer } from "@/lib/server/admin-auth";
import { cn } from "@/lib/utils";

export { clearAdminToken, getAdminToken, setAdminToken };

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      void navigate({ to: "/admin" });
    }
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const result = await adminLoginServer({ data: { email: email.trim(), password } });
      setAdminToken(result.token);
      toast.success(`Welcome back, ${result.user.email}!`);
      await navigate({ to: "/admin" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-surface/50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <BrandMark />
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                <ShieldCheck className="size-3.5" />
                <span>Admin Portal</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-fg">Operations Dashboard</h1>
            <p className="text-sm text-muted mt-1">
              Sign in with your admin credentials to access the control panel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => void handleLogin(e)} className="px-8 py-6 space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-sm font-medium text-fg-2">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="admin@admin.com"
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-sm font-medium text-fg-2">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin password"
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg-2 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger flex items-start gap-2">
                <Shield className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Sign in to Admin
                </>
              )}
            </Button>

            {/* Hint */}
            <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-xs text-muted">
              <p className="font-medium text-fg-2 mb-1">Default credentials</p>
              <p>Email: <span className="font-mono text-fg">admin@admin.com</span></p>
              <p>Password: <span className="font-mono text-fg">admin123</span></p>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-border px-8 py-4 bg-surface-2/30">
            <p className="text-xs text-faint text-center">
              TrustHouse Admin Portal · Restricted Access Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
