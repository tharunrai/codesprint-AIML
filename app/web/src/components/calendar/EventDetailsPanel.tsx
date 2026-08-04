"use client";

import Link from "next/link";
import { type CalendarEvent } from "@/lib/types";;
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface EventDetailsPanelProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export default function EventDetailsPanel({
  event,
  onClose,
}: EventDetailsPanelProps) {
  if (!event) return null;

  const typeVariantMap: Record<
    CalendarEvent["type"],
    "info" | "success" | "warning" | "default"
  > = {
    interview: "info",
    "offer-deadline": "success",
    assessment: "warning",
    "campus-drive": "info",
    "placement-event": "default",
  };

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5 animate-fade-in relative">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <Badge variant={typeVariantMap[event.type]} size="sm" dot>
            {event.type.replace("-", " ").toUpperCase()}
          </Badge>
          <h3 className="text-lg font-bold text-foreground leading-tight truncate">
            {event.title}
          </h3>
          {event.company && (
            <p className="text-sm font-medium text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              {event.company}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Details Grid */}
      <div className="space-y-4 text-sm">
        {/* Date & Time */}
        <div className="flex items-start gap-3 bg-background/50 p-3 rounded-xl border border-border/50">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">
              Date & Time
            </span>
            <span className="font-semibold text-foreground block">
              {formattedDate}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5 block">
              {event.time || "All Day Event"}{" "}
              {event.durationMins ? `(${event.durationMins} mins)` : ""}
            </span>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-3 bg-background/50 p-3 rounded-xl border border-border/50">
            <div className="p-2 rounded-lg bg-success/10 text-success shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground block">
                Location / Platform
              </span>
              <span className="font-semibold text-foreground block">
                {event.location}
              </span>
            </div>
          </div>
        )}

        {/* Target Audience */}
        <div className="flex items-center justify-between text-xs py-1 border-y border-border/40">
          <span className="text-muted-foreground">Audience Scope:</span>
          <span className="font-semibold text-foreground uppercase tracking-wide">
            {event.targetRole === "both" ? "Students & Faculty" : event.targetRole}
          </span>
        </div>

        {/* Description */}
        {event.description && (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground block">
              Event Overview
            </span>
            <p className="text-xs text-foreground/80 leading-relaxed bg-surface-hover/50 p-3 rounded-xl border border-border/30">
              {event.description}
            </p>
          </div>
        )}
      </div>

      {/* Action Footers */}
      <div className="pt-2 flex items-center gap-2">
        {event.driveId && (
          <Link href={`/drives`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              View Placement Drive
            </Button>
          </Link>
        )}
        <Button variant="secondary" size="sm" onClick={onClose} className={event.driveId ? "" : "w-full"}>
          Close Panel
        </Button>
      </div>
    </div>
  );
}
