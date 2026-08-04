"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import { getDrives } from "@/app/actions/drives";
import { getApplications } from "@/app/actions/applications";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  computeAnalyticsSummary,
  computeBranchStats,
  computeDriveCtcStats,
  computeConversionFunnel,
  exportToCSV,
} from "@/lib/analytics-utils";
import { formatCTC } from "@/lib/utils";;
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
} from "recharts";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFunnelDrive, setSelectedFunnelDrive] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [_drives, _apps] = await Promise.all([getDrives(), getApplications()]);
        setDrives(_drives);
        setApplications(_apps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isFaculty = user?.role === "FACULTY";

  // Real-time derived analytics from PlacementContext
  const summary = useMemo(
    () => computeAnalyticsSummary(drives, applications),
    [drives, applications]
  );

  const branchStats = useMemo(
    () => computeBranchStats(applications, drives),
    [applications, drives]
  );

  const driveCtcStats = useMemo(
    () => computeDriveCtcStats(drives, applications),
    [drives, applications]
  );

  const funnelStages = useMemo(
    () => computeConversionFunnel(applications, selectedFunnelDrive),
    [applications, selectedFunnelDrive]
  );

  const handleExportCSV = () => {
    exportToCSV(applications, drives, `placeme_report_${new Date().toISOString().slice(0, 10)}.csv`);
    showToast("CSV Placement Report downloaded successfully!");
  };

  const handleExportPDF = () => {
    // TODO: Wire up real PDF export service (Section 4.4 of specs.md)
    showToast("PDF Export scheduled for backend report generation. CSV export is active.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <>
      <Header
        title={isFaculty ? "Placement Analytics & Insights" : "Placement Statistics"}
        subtitle={
          isFaculty
            ? "Live campus recruitment metrics, branch trends, and recruitment conversion funnels"
            : "Overview of campus recruitment performance and placement distributions"
        }
      />

      <div className="p-6 space-y-6 max-w-7xl">
        {/* Student Role Notice if accessed as student */}
        {!isFaculty && (
          <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                <span className="text-info text-lg font-bold">ℹ</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Viewing Public Campus Statistics
                </p>
                <p className="text-xs text-muted-foreground">
                  Switch to the Faculty account to access student-level pipeline actions and administrative reports.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Header & Exports */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Placement Season 2025–26
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time aggregation across {drives.length} drives and {applications.length} applications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="export-csv-btn"
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            >
              Export CSV
            </Button>

            <Button
              id="export-pdf-btn"
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              }
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-surface border border-primary/40 shadow-2xl text-foreground text-xs font-semibold flex items-center gap-3 animate-fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="cursor-pointer text-muted-foreground hover:text-foreground ml-3 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students Placed"
            value={`${summary.totalPlaced} / ${summary.totalEligible}`}
            subtext={`${summary.totalEligible - summary.totalPlaced} currently in process`}
            icon={
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            }
            badge={<Badge variant="success">Active Cohort</Badge>}
          />

          <StatCard
            title="Overall Placement %"
            value={`${summary.placementPercentage}%`}
            subtext="Target goal: 85% by season end"
            icon={
              <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            }
            badge={
              <Badge variant={summary.placementPercentage >= 75 ? "success" : "warning"}>
                {summary.placementPercentage >= 75 ? "On Track" : "In Progress"}
              </Badge>
            }
          />

          <StatCard
            title="Average Package (CTC)"
            value={formatCTC(summary.averageCTC)}
            subtext={`Highest offer: ${formatCTC(summary.highestCTC)}`}
            icon={
              <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            }
            badge={<Badge variant="info">CTC Trend</Badge>}
          />

          <StatCard
            title="Active Campus Drives"
            value={`${summary.activeDrives} Open`}
            subtext={`${drives.length} total drives posted`}
            icon={
              <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            }
            badge={<Badge variant="default">{drives.length} Total</Badge>}
          />
        </div>

        {/* 2. Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Placement % by Branch (Bar Chart) */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground text-base">
                  Placement Rate by Branch (%)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Percentage of registered students securing at least one offer
                </p>
              </div>
              <Badge variant="info" size="sm">
                Branch Analysis
              </Badge>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="branch"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomBranchTooltip />} />
                  <Bar
                    dataKey="placementRate"
                    radius={[6, 6, 0, 0]}
                    fill="hsl(var(--primary))"
                  >
                    {branchStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.placementRate >= 80
                            ? "hsl(var(--primary))"
                            : entry.placementRate >= 60
                              ? "hsl(var(--accent))"
                              : "hsl(var(--warning))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Package / CTC Distribution across Drives */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground text-base">
                  CTC Distribution across Drives
                </h3>
                <p className="text-xs text-muted-foreground">
                  Offered compensation packages (in ₹ LPA) per hiring partner
                </p>
              </div>
              <Badge variant="default" size="sm">
                Compensation
              </Badge>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={driveCtcStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ctcGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="company"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip content={<CustomCtcTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="ctcLakh"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#ctcGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 3. Conversion Funnel Section */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-foreground text-base">
                Recruitment Conversion Funnel
              </h3>
              <p className="text-xs text-muted-foreground">
                Drop-off and conversion rates through hiring pipeline stages
              </p>
            </div>

            {/* Drive filter selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Drive Filter:</span>
              <select
                value={selectedFunnelDrive}
                onChange={(e) => setSelectedFunnelDrive(e.target.value)}
                className="h-9 px-3 rounded-lg text-xs bg-surface-hover border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="all">All Drives Combined ({applications.length} applications)</option>
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.companyName} — {d.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Funnel Bar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {funnelStages.map((stage, idx) => {
              const prevCount = idx === 0 ? stage.count : funnelStages[idx - 1].count;
              const stepConversion =
                prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : 0;

              return (
                <div
                  key={stage.stage}
                  className="p-4 rounded-xl bg-surface-hover/70 border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Step {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {stage.conversionRate}% overall
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {stage.stage}
                    </h4>
                    <p className="text-2xl font-extrabold text-foreground mt-2">
                      {stage.count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      candidates reached
                    </p>
                  </div>

                  {idx > 0 && (
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Pass-through rate:</span>
                      <span className="font-semibold text-foreground">
                        {stepConversion}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 4. Detailed Branch Performance Breakdown Table */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Branch-wise Placement Breakdown
              </h3>
              <p className="text-xs text-muted-foreground">
                Detailed student counts, placement ratios, and average compensation
              </p>
            </div>
            <Badge variant="default" size="sm">
              {branchStats.length} Branches
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-6">Branch</th>
                  <th className="py-3 px-6">Total Cohort</th>
                  <th className="py-3 px-6">Placed Count</th>
                  <th className="py-3 px-6">Placement Rate</th>
                  <th className="py-3 px-6">Average CTC</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {branchStats.map((b) => (
                  <tr key={b.branch} className="hover:bg-surface-hover/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-foreground">
                      {b.branch}
                    </td>
                    <td className="py-3.5 px-6 text-muted-foreground">
                      {b.totalStudents} students
                    </td>
                    <td className="py-3.5 px-6 font-medium text-foreground">
                      {b.placedStudents} placed
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-surface-hover h-2 rounded-full overflow-hidden border border-border">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${b.placementRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {b.placementRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-foreground">
                      {formatCTC(b.avgCtc)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Badge
                        variant={
                          b.placementRate >= 80
                            ? "success"
                            : b.placementRate >= 50
                              ? "warning"
                              : "default"
                        }
                        size="sm"
                      >
                        {b.placementRate >= 80
                          ? "High"
                          : b.placementRate >= 50
                            ? "Moderate"
                            : "Ongoing"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ── Custom Tooltips ────────────────────────────────────────── */

interface TooltipProps<T> {
  active?: boolean;
  payload?: Array<{ payload: T }>;
  label?: string;
}

function CustomBranchTooltip({ active, payload, label }: TooltipProps<{ placementRate: number; placedStudents: number; totalStudents: number; avgCtc: number }>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
        <p className="font-bold text-foreground">{label} Department</p>
        <p className="text-muted-foreground">
          Placement Rate: <span className="font-semibold text-primary">{data.placementRate}%</span>
        </p>
        <p className="text-muted-foreground">
          Placed: <span className="font-semibold text-foreground">{data.placedStudents} / {data.totalStudents}</span>
        </p>
        <p className="text-muted-foreground">
          Avg Package: <span className="font-semibold text-foreground">{formatCTC(data.avgCtc)}</span>
        </p>
      </div>
    );
  }
  return null;
}

function CustomCtcTooltip({ active, payload }: TooltipProps<{ company: string; role: string; ctcLakh: number; appliedCount: number; offersCount: number }>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
        <p className="font-bold text-foreground">{data.company}</p>
        <p className="text-muted-foreground">{data.role}</p>
        <p className="text-accent font-semibold pt-1">
          CTC: ₹{data.ctcLakh} LPA
        </p>
        <p className="text-muted text-[10px]">
          {data.appliedCount} applicants • {data.offersCount} offers extended
        </p>
      </div>
    );
  }
  return null;
}

/* ── Stat Card Subcomponent ─────────────────────────────────── */

function StatCard({
  title,
  value,
  subtext,
  icon,
  badge,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  badge: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-surface-hover border border-border">
          {icon}
        </div>
        {badge}
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>
    </Card>
  );
}
