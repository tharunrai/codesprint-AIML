"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

const BRANCHES = ["CSE", "ISE", "ECE", "EEE", "ME", "CE", "CV"];
const SKILLS = [
  "React", "TypeScript", "JavaScript", "Python", "Java", "C++",
  "Node.js", "SQL", "Docker", "AWS", "Machine Learning", "Data Science",
  "Go", "Rust", "Flutter", "Swift", "Kubernetes", "Git",
];

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const userAny = user as any;
  const [branch, setBranch] = useState(userAny?.branch || "");
  const [cgpa, setCgpa] = useState(userAny?.cgpa?.toString() || "");
  const [year, setYear] = useState(userAny?.year?.toString() || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(userAny?.skills || []);
  const [loading, setLoading] = useState(false);

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function handleNext() {
    if (step < 3) setStep(step + 1);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleFinish(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: Replace with real API call to save profile
    await new Promise((r) => setTimeout(r, 800));
    completeOnboarding();
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Complete your profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Help us personalize your placement experience
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                  transition-all duration-300
                  ${
                    s < step
                      ? "bg-success text-success-foreground"
                      : s === step
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-surface-hover text-muted"
                  }
                `}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                    s < step ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <form onSubmit={handleFinish}>
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold text-foreground">
                  Academic Details
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Branch
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-lg text-sm bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer"
                    >
                      <option value="" disabled>
                        Select your branch
                      </option>
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="CGPA"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.4"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    required
                  />
                  <Input
                    label="Year of Study"
                    type="number"
                    min="1"
                    max="5"
                    placeholder="e.g. 4"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold text-foreground">
                  Your Skills
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select the skills that match your profile. These help us
                  suggest relevant drives.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => {
                    const selected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer
                          ${
                            selected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-surface-hover text-muted-foreground hover:bg-border hover:text-foreground"
                          }
                        `}
                      >
                        {selected && "✓ "}
                        {skill}
                      </button>
                    );
                  })}
                </div>
                {selectedSkills.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedSkills.length} skill
                    {selectedSkills.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-lg font-semibold text-foreground">
                  Resume Upload
                </h2>
                <p className="text-sm text-muted-foreground">
                  Upload your latest resume. You can update it anytime later.
                </p>
                {/* Upload area */}
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF or DOCX, max 5 MB
                  </p>
                  {/* TODO: Wire up actual file upload to Supabase Storage */}
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      document.getElementById("resume-upload")?.click()
                    }
                  >
                    Choose file
                  </Button>
                </div>
                {/* Summary */}
                <div className="bg-surface-hover rounded-xl p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Profile Summary
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="info">{branch || "—"}</Badge>
                    <Badge variant="default">CGPA: {cgpa || "—"}</Badge>
                    <Badge variant="default">Year {year || "—"}</Badge>
                  </div>
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedSkills.slice(0, 8).map((s) => (
                        <Badge key={s} variant="success" size="sm">
                          {s}
                        </Badge>
                      ))}
                      {selectedSkills.length > 8 && (
                        <Badge variant="default" size="sm">
                          +{selectedSkills.length - 8} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={handleBack}>
                ← Back
              </Button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Continue →
              </Button>
            ) : (
              <Button type="submit" loading={loading}>
                Complete Setup
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
