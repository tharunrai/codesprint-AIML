"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { type Drive, type RoundInfo } from "@/lib/mock-data";

interface CreateDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (driveData: Omit<Drive, "id" | "postedDate" | "registeredCount">) => void;
}

const AVAILABLE_BRANCHES = ["CSE", "ISE", "ECE", "EEE", "ME", "CE", "CV"];

const DEFAULT_ROUNDS: RoundInfo[] = [
  { id: "r1", name: "Online Assessment", type: "OA", order: 1 },
  { id: "r2", name: "Technical Interview", type: "Technical", order: 2 },
  { id: "r3", name: "HR / Managerial Round", type: "HR", order: 3 },
];

export default function CreateDriveModal({ isOpen, onClose, onSubmit }: CreateDriveModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [ctcLakh, setCtcLakh] = useState("18");
  const [ctcBreakdown, setCtcBreakdown] = useState("");
  const [roleType, setRoleType] = useState<"Full-time" | "Internship" | "PPO">("Full-time");
  const [minCgpa, setMinCgpa] = useState("7.0");
  const [selectedBranches, setSelectedBranches] = useState<string[]>(["CSE", "ISE", "ECE"]);
  const [maxBacklogs, setMaxBacklogs] = useState("0");
  const [deadline, setDeadline] = useState("2026-08-30");
  const [rounds, setRounds] = useState<RoundInfo[]>(DEFAULT_ROUNDS);
  const [newRoundName, setNewRoundName] = useState("");
  const [newRoundType, setNewRoundType] = useState<RoundInfo["type"]>("Technical");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const toggleBranch = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      if (selectedBranches.length > 1) {
        setSelectedBranches(selectedBranches.filter((b) => b !== branch));
      }
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const addRound = () => {
    if (!newRoundName.trim()) return;
    const newRound: RoundInfo = {
      id: `r${rounds.length + 1}`,
      name: newRoundName.trim(),
      type: newRoundType,
      order: rounds.length + 1,
    };
    setRounds([...rounds, newRound]);
    setNewRoundName("");
  };

  const removeRound = (id: string) => {
    if (rounds.length <= 1) return;
    setRounds(rounds.filter((r) => r.id !== id).map((r, idx) => ({ ...r, order: idx + 1 })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim() || !description.trim()) {
      setError("Please fill in all required fields (Company, Role, Description).");
      return;
    }

    const ctc = parseFloat(ctcLakh);
    const cgpa = parseFloat(minCgpa);
    const backlogs = parseInt(maxBacklogs);

    if (isNaN(ctc) || ctc <= 0) {
      setError("Please enter a valid CTC.");
      return;
    }

    onSubmit({
      companyName: companyName.trim(),
      role: role.trim(),
      description: description.trim(),
      ctcLakh: ctc,
      ctcBreakdown: ctcBreakdown.trim() || undefined,
      roleType,
      eligibility: {
        minCgpa: isNaN(cgpa) ? 0 : cgpa,
        branches: selectedBranches,
        maxBacklogs: isNaN(backlogs) ? 0 : backlogs,
      },
      deadline: new Date(deadline).toISOString(),
      status: "open",
      rounds,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Post New Placement Drive</h2>
            <p className="text-xs text-muted-foreground">Publish a new campus recruitment drive for students</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
              {error}
            </div>
          )}

          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              placeholder="e.g. Amazon, Oracle"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Role Title *"
              placeholder="e.g. SDE 1, Cloud Associate"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Job Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the opportunity, key responsibilities, and team overview..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
              required
            />
          </div>

          {/* CTC & Role Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="CTC (in LPA) *"
              type="number"
              step="0.5"
              placeholder="e.g. 18"
              value={ctcLakh}
              onChange={(e) => setCtcLakh(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">Role Type</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg text-sm bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="PPO">PPO</option>
              </select>
            </div>
            <Input
              label="Deadline *"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          {/* Compensation Breakdown */}
          <Input
            label="Compensation Breakdown (Optional)"
            placeholder="e.g. Base: ₹14L + Performance Bonus: ₹2L + Joining Bonus: ₹2L"
            value={ctcBreakdown}
            onChange={(e) => setCtcBreakdown(e.target.value)}
          />

          {/* Eligibility Criteria */}
          <Card className="bg-surface-hover/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Eligibility Criteria
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum CGPA"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
              />
              <Input
                label="Max Allowed Backlogs"
                type="number"
                min="0"
                max="10"
                value={maxBacklogs}
                onChange={(e) => setMaxBacklogs(e.target.value)}
              />
            </div>

            {/* Branches Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Eligible Branches
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_BRANCHES.map((b) => {
                  const selected = selectedBranches.includes(b);
                  return (
                    <button
                      type="button"
                      key={b}
                      onClick={() => toggleBranch(b)}
                      className={`
                        px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer
                        ${
                          selected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-surface text-muted-foreground border-border hover:border-border-hover"
                        }
                      `}
                    >
                      {b} {selected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Configurable Rounds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground">
                Hiring Pipeline Rounds ({rounds.length})
              </label>
            </div>

            <div className="space-y-2">
              {rounds.map((r, idx) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-hover border border-border text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-foreground">{r.name}</span>
                    <Badge variant="default" size="sm">
                      {r.type}
                    </Badge>
                  </div>
                  {rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRound(r.id)}
                      className="text-xs text-danger hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add round sub-form */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add round name (e.g. Technical 2)"
                value={newRoundName}
                onChange={(e) => setNewRoundName(e.target.value)}
                className="flex-1 h-9 px-3 text-xs rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <select
                value={newRoundType}
                onChange={(e) => setNewRoundType(e.target.value as any)}
                className="h-9 px-2 text-xs rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="OA">OA</option>
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="GD">GD</option>
                <option value="Coding">Coding</option>
                <option value="Final">Final</option>
              </select>
              <Button type="button" variant="secondary" size="sm" onClick={addRound}>
                + Add
              </Button>
            </div>
          </div>

          {/* Action buttons in modal footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Publish Drive
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
