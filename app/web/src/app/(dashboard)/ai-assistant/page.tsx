"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Sparkles, FileText, Building2, GraduationCap, Upload, Search, BookOpen, Target, AlertTriangle, CheckCircle2, ArrowRight, Zap, Brain, TrendingUp } from "lucide-react";

type Tab = "resume" | "research" | "coach";

interface ResumeSection {
  title: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

interface ResumeResult {
  score: number;
  summary: string;
  sections: ResumeSection[];
  topStrengths: string[];
  criticalFixes: string[];
}

interface CompanyResult {
  companyName: string;
  role: string;
  overview: string;
  techStack: string[];
  culture: string;
  interviewProcess: string;
  recentNews: string[];
  salaryRange: string;
  tips: string[];
}

interface PrepTopic {
  name: string;
  priority: string;
  description: string;
}

interface PrepResource {
  name: string;
  url: string;
  description: string;
}

interface PrepResult {
  company: string;
  title: string;
  description: string;
  topics: PrepTopic[];
  questionTypes: string[];
  resources: PrepResource[];
  proTips: string[];
}

export default function AIAssistantPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  const initialCompany = searchParams.get("company") || "";
  const initialRole = searchParams.get("role") || "";
  const initialRound = searchParams.get("round") || "";

  const [activeTab, setActiveTab] = useState<Tab>("resume");

  // Resume Analyzer State
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState(initialRole || "Software Engineer");
  const [resumeResult, setResumeResult] = useState<ResumeResult | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Company Research State
  const [companyName, setCompanyName] = useState(initialCompany);
  const [companyRole, setCompanyRole] = useState(initialRole);
  const [companyResult, setCompanyResult] = useState<CompanyResult | null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  // Prep Coach State
  const [roundType, setRoundType] = useState("technical");
  const [prepCompany, setPrepCompany] = useState(initialCompany);
  const [prepResult, setPrepResult] = useState<PrepResult | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);

  useEffect(() => {
    if (initialCompany && initialRound) {
      setActiveTab("coach");
      // Basic reverse mapping for round
      if (initialRound.toLowerCase().includes("hr") || initialRound.toLowerCase().includes("behavioral")) {
        setRoundType("hr");
      } else if (initialRound.toLowerCase().includes("system design")) {
        setRoundType("system-design");
      } else if (initialRound.toLowerCase().includes("assessment") || initialRound.toLowerCase().includes("oa")) {
        setRoundType("oa");
      } else {
        setRoundType("technical");
      }
    } else if (initialCompany) {
      setActiveTab("research");
    }
  }, [initialCompany, initialRound]);

  const handleResumeAnalyze = async () => {
    if (!resumeText.trim()) return;
    setResumeLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText, target_role: targetRole }),
      });
      const body = await res.json();
      if (!body.success) {
        throw new Error(body.error?.message || "API error");
      }
      setResumeResult(body.data);
    } catch (err: any) {
      console.error(err);
      // Fallback mock data
      setResumeResult({
        score: 75,
        summary: "Your resume is decently structured but misses some key action verbs and specific technical keywords for the target role.",
        sections: [
          { title: "Experience", score: 80, feedback: "Good bullet points.", suggestions: ["Add metrics"] }
        ],
        topStrengths: ["Good project experience", "Clear formatting"],
        criticalFixes: ["Missing keywords", "Formatting issues"],
      });
    } finally {
      setResumeLoading(false);
    }
  };

  const handleCompanyResearch = async () => {
    if (!companyName.trim()) return;
    setCompanyLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/company-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName, role: companyRole || targetRole }),
      });
      const body = await res.json();
      if (!body.success) {
        throw new Error(body.error?.message || "API error");
      }
      setCompanyResult(body.data);
    } catch (err: any) {
      console.error(err);
      // Fallback mock data when backend is not running
      setCompanyResult({
        companyName: companyName,
        role: companyRole || targetRole || "Software Engineer",
        overview: `${companyName} is a mock company since the backend is unreachable.`,
        techStack: ["React", "Node.js", "Python"],
        culture: "Fast-paced, innovative.",
        interviewProcess: "OA -> Technical -> HR",
        recentNews: ["Recent mock news 1", "Recent mock news 2"],
        salaryRange: "10-15 LPA",
        tips: ["Know your fundamentals", "Be prepared for system design"]
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  const handlePrepCoach = async () => {
    const roundMap: Record<string, string> = {
      "oa": "Online Assessment (OA)",
      "technical": "Technical Interview",
      "hr": "HR / Behavioral Interview",
      "system-design": "System Design Interview"
    };
    const roundName = roundMap[roundType] || "Technical Interview";

    setPrepLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/prep-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: prepCompany, role: companyRole || targetRole, round: roundName }),
      });
      const body = await res.json();
      if (!body.success) {
        throw new Error(body.error?.message || "API error");
      }
      setPrepResult(body.data);
    } catch (err: any) {
      console.error(err);
      // Fallback mock data
      setPrepResult({
        company: prepCompany || "Mock Company",
        title: `${roundName} Prep`,
        description: "A comprehensive guide to cracking this round.",
        topics: [
          { name: "Data Structures", priority: "High", description: "Arrays, Strings, Trees" }
        ],
        questionTypes: ["Coding", "System Design"],
        resources: [
          { name: "LeetCode", url: "https://leetcode.com", description: "Practice coding questions" }
        ],
        proTips: ["Think out loud", "Write clean code"],
      });
    } finally {
      setPrepLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Set file text if it's a txt file for the textarea
    if (file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setResumeText(text || "");
      };
      reader.readAsText(file);
      e.target.value = "";
      return;
    }

    // For PDF files, use the upload endpoint
    if (file.name.endsWith('.pdf')) {
      setResumeLoading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("target_role", targetRole);
        const res = await fetch("http://127.0.0.1:8000/api/analyze-resume-file", { 
          method: "POST", 
          body: fd 
        });
        const body = await res.json();
        if (!body.success) {
          console.error(body.error?.message);
          return;
        }
        setResumeResult(body.data);
      } catch (err) {
        console.error(err);
      } finally {
        setResumeLoading(false);
        e.target.value = "";
      }
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "resume", label: "Resume Analyzer", icon: <FileText className="w-4 h-4" />, desc: "ATS score & improvement tips" },
    { id: "research", label: "Company Research", icon: <Building2 className="w-4 h-4" />, desc: "Interview intel & culture" },
    { id: "coach", label: "Prep Coach", icon: <GraduationCap className="w-4 h-4" />, desc: "Round-wise preparation" },
  ];

  const isFaculty = user?.role === "FACULTY";

  return (
    <>
      <Header
        title="AI Placement Assistant"
        subtitle={
          isFaculty
            ? "AI-powered tools to help students prepare better for placements"
            : "Your AI-powered placement preparation companion — analyze, research, and prepare smarter"
        }
      />

      <div className="p-6 space-y-6 max-w-6xl">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-accent/10 to-primary/5 border border-primary/20 p-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                AI-Powered Placement Suite
                <Badge variant="info" size="sm">Beta</Badge>
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Get instant resume feedback, company intelligence, and round-specific preparation strategies.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 bg-surface-hover/50 p-1.5 rounded-2xl border border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-md border border-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "resume" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input */}
            <Card className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Resume Analyzer</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option>Software Engineer</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Data Scientist</option>
                  <option>Product Manager</option>
                  <option>DevOps Engineer</option>
                  <option>Full Stack Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Resume Content
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here, or upload a .txt file below..."
                  rows={10}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none placeholder:text-muted"
                />
              </div>

              <div className="relative border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-4 text-center cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <span className="text-xs font-semibold text-foreground">Upload Resume (.txt, .pdf)</span>
              </div>

              <Button
                onClick={handleResumeAnalyze}
                disabled={!resumeText.trim() || resumeLoading}
                className="w-full"
              >
                {resumeLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing with AI...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Analyze Resume
                  </span>
                )}
              </Button>
            </Card>

            {/* Results */}
            <div className="lg:col-span-7 space-y-4">
              {!resumeResult ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Ready to Analyze</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Paste your resume text and click Analyze to get ATS compatibility score, improvement suggestions, and role alignment feedback.
                  </p>
                </Card>
              ) : (
                <>
                  {/* Score Card */}
                  <Card className="bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
                    <div className="flex items-center gap-6">
                      <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={resumeResult.score >= 75 ? "hsl(var(--success))" : resumeResult.score >= 50 ? "hsl(var(--warning))" : "hsl(var(--danger))"}
                            strokeWidth="3"
                            strokeDasharray={`${resumeResult.score}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-foreground">
                          {resumeResult.score}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Overall Resume Score</h3>
                        <p className="text-sm text-muted-foreground mt-1">{resumeResult.summary}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Critical Fixes */}
                  {resumeResult.criticalFixes.length > 0 && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-foreground">Critical Improvements</h4>
                      </div>
                      <ul className="space-y-2">
                        {resumeResult.criticalFixes.map((fix, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            {fix}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Section Scores */}
                  {resumeResult.sections.map((section, i) => (
                    <Card key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-foreground">{section.title}</h4>
                        <Badge
                          variant={section.score >= 75 ? "success" : section.score >= 50 ? "warning" : "danger"}
                          size="sm"
                        >
                          {section.score}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{section.feedback}</p>
                      <ul className="space-y-1.5">
                        {section.suggestions.map((s, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Zap className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}

                  {/* Strengths */}
                  <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-bold text-foreground">Your Strengths</h4>
                    </div>
                    <ul className="space-y-1.5">
                      {resumeResult.topStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "research" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input */}
            <Card className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Company Research</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Razorpay..."
                  className="w-full h-10 px-3 rounded-lg text-sm bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  value={companyRole}
                  onChange={(e) => setCompanyRole(e.target.value)}
                  placeholder="e.g. SDE, Data Analyst..."
                  className="w-full h-10 px-3 rounded-lg text-sm bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted"
                />
              </div>

              <Button
                onClick={handleCompanyResearch}
                disabled={!companyName.trim() || companyLoading}
                className="w-full"
              >
                {companyLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Researching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" /> Research Company
                  </span>
                )}
              </Button>

              {/* Quick Access */}
              <div className="pt-3 border-t border-border">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Access</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Google", "Microsoft", "Razorpay", "Deloitte"].map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCompanyName(c); }}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-surface-hover hover:bg-primary/10 hover:text-primary border border-border transition-colors cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Results */}
            <div className="lg:col-span-8 space-y-4">
              {!companyResult ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Research a Company</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Enter a company name to get instant intelligence on their tech stack, interview process, culture, and preparation tips.
                  </p>
                </Card>
              ) : (
                <>
                  {/* Company Header */}
                  <Card className="bg-gradient-to-r from-accent/5 via-background to-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center shrink-0 border border-accent/20">
                        <span className="text-primary font-black text-xl">{companyResult.companyName.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-foreground">{companyResult.companyName}</h3>
                        <p className="text-sm text-muted-foreground">Target Role: {companyResult.role}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Overview */}
                  <Card>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Company Overview</h4>
                    <p className="text-sm text-foreground leading-relaxed">{companyResult.overview}</p>
                  </Card>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tech Stack</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {companyResult.techStack.map((tech, i) => (
                          <Badge key={i} variant="info" size="sm">{tech}</Badge>
                        ))}
                      </div>
                    </Card>

                    <Card>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Salary Range</h4>
                      <p className="text-lg font-bold text-primary">{companyResult.salaryRange}</p>
                    </Card>
                  </div>

                  <Card>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interview Process</h4>
                    <p className="text-sm text-foreground leading-relaxed">{companyResult.interviewProcess}</p>
                  </Card>

                  <Card>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Culture & Work Environment</h4>
                    <p className="text-sm text-foreground leading-relaxed">{companyResult.culture}</p>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-foreground">Preparation Tips</h4>
                    </div>
                    <ul className="space-y-2">
                      {companyResult.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "coach" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input */}
            <Card className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Prep Coach</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Round Type
                </label>
                <select
                  value={roundType}
                  onChange={(e) => setRoundType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="oa">Online Assessment (OA)</option>
                  <option value="technical">Technical Interview</option>
                  <option value="hr">HR / Behavioral</option>
                  <option value="system-design">System Design</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  value={prepCompany}
                  onChange={(e) => setPrepCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon..."
                  className="w-full h-10 px-3 rounded-lg text-sm bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted"
                />
              </div>

              <Button onClick={handlePrepCoach} disabled={prepLoading} className="w-full">
                {prepLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Plan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Generate Prep Plan
                  </span>
                )}
              </Button>
            </Card>

            {/* Results */}
            <div className="lg:col-span-8 space-y-4">
              {!prepResult ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-warning" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Get Round-Specific Guidance</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Select a round type and optionally specify a company to get targeted preparation strategies, topic checklists, and curated resources.
                  </p>
                </Card>
              ) : (
                <>
                  {/* Prep Header */}
                  <Card className="bg-gradient-to-r from-warning/5 via-background to-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning/20 to-primary/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-7 h-7 text-warning" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-foreground">{prepResult.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {prepResult.company !== "General" ? `Tailored for ${prepResult.company}` : "General Preparation Guide"}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <p className="text-sm text-foreground leading-relaxed">{prepResult.description}</p>
                  </Card>

                  {/* Topics */}
                  <Card>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Topics to Prepare</h4>
                    <div className="space-y-2.5">
                      {prepResult.topics.map((topic, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-surface-hover/50 border border-border/50">
                          <div>
                            <h5 className="text-sm font-bold text-foreground">{topic.name}</h5>
                            <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
                          </div>
                          <Badge
                            variant={topic.priority === "High" ? "danger" : topic.priority === "Medium" ? "warning" : "default"}
                            size="sm"
                          >
                            {topic.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Question Types */}
                  <Card>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Common Question Types</h4>
                    <ul className="space-y-1.5">
                      {prepResult.questionTypes.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Resources */}
                  <Card>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommended Resources</h4>
                    <div className="space-y-2">
                      {prepResult.resources.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-hover/50 border border-border/50">
                          <div>
                            <h5 className="text-sm font-bold text-foreground">{r.name}</h5>
                            <p className="text-xs text-muted-foreground">{r.description}</p>
                          </div>
                          {r.url !== "#" && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm">Visit →</Button>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Pro Tips */}
                  <Card className="border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <h4 className="font-bold text-foreground">Pro Tips</h4>
                    </div>
                    <ul className="space-y-2">
                      {prepResult.proTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
