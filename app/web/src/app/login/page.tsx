"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { type Role as UserRole } from "@prisma/client";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // We use the createClient here directly for sign up since context only handles login
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role, name: email.split("@")[0] }
          }
        });
        
        if (signUpError) {
          console.warn("Supabase signUp error (bypassing for dev):", signUpError.message);
        }
        // If email confirmation is disabled, user is logged in
      }

      const ok = await login(email, password);
      if (ok) {
        router.push("/drives");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background animate-fade-in">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-accent to-primary/80 relative overflow-hidden">
        {/* Floating shapes for visual depth */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-subtle" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse-subtle stagger-2" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/10 rounded-2xl blur-2xl -translate-x-1/2 -translate-y-1/2 rotate-45 animate-pulse-subtle stagger-4" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white animate-slide-in-right">
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
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">PlaceMe</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">{isSignUp ? "Create an account" : "Welcome back"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? "Register your college details below" : "Sign in with your college credentials to continue"}
            </p>
          </div>

          {/* Role toggle (only for sign up) */}
          {isSignUp && (
            <div className="flex bg-surface-hover rounded-xl p-1 gap-1">
              {(["STUDENT", "FACULTY"] as const).map((r) => (
                <button
                  type="button"
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
                  {r === "STUDENT" ? "Student" : "Faculty / TPC"}
                </button>
              ))}
            </div>
          )}

          {/* Demo Credentials Helper Card Layout */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Demo Access (Testing)
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Student Card */}
              <button
                type="button"
                onClick={() => {
                  setEmail("arjun.mehta@college.edu");
                  setPassword("password123");
                  setRole("STUDENT");
                }}
                className={`
                  text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer
                  ${
                    email === "arjun.mehta@college.edu"
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-surface border-border hover:border-border-hover hover:bg-surface-hover"
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-semibold text-sm">Student Portal</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">Arjun Mehta</p>
                <p className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">arjun.mehta@...</p>
              </button>

              {/* Faculty Card */}
              <button
                type="button"
                onClick={() => {
                  setEmail("priya.sharma@college.edu");
                  setPassword("password123");
                  setRole("FACULTY");
                }}
                className={`
                  text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer
                  ${
                    email === "priya.sharma@college.edu"
                      ? "bg-amber-500/5 border-amber-500 shadow-sm"
                      : "bg-surface border-border hover:border-border-hover hover:bg-surface-hover"
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-sm">Faculty / TPC</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">Dr. Priya Sharma</p>
                <p className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">priya.sharma@...</p>
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground italic text-center">
              Click a card to fill credentials, then select <strong>Sign in</strong> or <strong>Sign up</strong>.
            </p>
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
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white shadow-md shadow-primary/10 transition-all duration-200 active:scale-[0.98]"
              size="lg"
            >
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-center mt-4">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
