"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { UserRole } from "@/lib/mock-data";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const ok = await login(email, password, role);
      if (ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-accent to-primary/80 relative overflow-hidden">
        {/* Floating shapes for visual depth */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/10 rounded-2xl blur-2xl -translate-x-1/2 -translate-y-1/2 rotate-45" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <span className="text-2xl font-bold">P</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your placement
            <br />
            journey, simplified.
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Browse drives, track applications, prepare for interviews — all in
            one place. Built for students and placement cells.
          </p>
          <div className="flex gap-6 mt-10 text-sm text-white/60">
            <div>
              <span className="text-2xl font-bold text-white block">500+</span>
              Students placed
            </div>
            <div>
              <span className="text-2xl font-bold text-white block">50+</span>
              Companies
            </div>
            <div>
              <span className="text-2xl font-bold text-white block">₹42L</span>
              Highest CTC
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">PlaceMe</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in with your college credentials to continue
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex bg-surface-hover rounded-xl p-1 gap-1">
            {(["student", "faculty"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${
                    role === r
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {r === "student" ? "Student" : "Faculty / TPC"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="College Email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              }
            />

            {error && (
              <div className="px-3 py-2 rounded-lg bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign in
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Demo mode — any credentials will work.
            <br />
            Select your role above and click Sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
