"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import { getCalendarEvents } from "@/app/actions/calendar";

type SortOrder = "asc" | "desc";

const TYPE_LABELS: Record<string, string> = {
  interview: "Interview",
  assessment: "Assessment",
  "offer-deadline": "Offer Deadline",
  "campus-drive": "Campus Drive",
  "placement-event": "Placement Event",
};

const TYPE_COLORS: Record<string, string> = {
  interview: "bg-primary/10 text-primary",
  assessment: "bg-warning/10 text-warning",
  "offer-deadline": "bg-success/10 text-success",
  "campus-drive": "bg-purple-500/10 text-purple-400",
  "placement-event": "bg-muted/20 text-muted-foreground",
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const isFaculty = user?.role === "FACULTY";

  useEffect(() => {
    async function load() {
      try {
        const data = await getCalendarEvents();
        setEvents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleEvents = events
    .filter((e) => {
      if (!isFaculty && e.targetRole === "faculty") return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortOrder === "asc" ? diff : -diff;
    });

  // Group by date
  const grouped: Record<string, any[]> = {};
  for (const evt of visibleEvents) {
    if (!grouped[evt.date]) grouped[evt.date] = [];
    grouped[evt.date].push(evt);
  }

  const uniqueTypes = Array.from(new Set(events.map((e) => e.type)));

  return (
    <>
      <Header
        title={isFaculty ? "Recruitment Schedule" : "My Placement Calendar"}
        subtitle={
          isFaculty
            ? `${visibleEvents.length} events across all drives — spot scheduling conflicts at a glance`
            : "Upcoming interviews, assessments, and deadlines"
        }
      />

      <div className="p-6 space-y-5 max-w-4xl">
        {/* Controls bar */}
        <div className="flex flex-wrap gap-3 items-center animate-fade-in">
          {/* Type filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            <FilterPill
              active={typeFilter === "all"}
              onClick={() => setTypeFilter("all")}
              label="All"
            />
            {uniqueTypes.map((t) => (
              <FilterPill
                key={t}
                active={typeFilter === t}
                onClick={() => setTypeFilter(t)}
                label={TYPE_LABELS[t] ?? t}
              />
            ))}
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder((s) => (s === "asc" ? "desc" : "asc"))}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-hover border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 20V4" />
            </svg>
            {sortOrder === "asc" ? "Earliest first" : "Latest first"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleEvents.length === 0 ? (
          <Card>
            <div className="py-16 text-center text-sm text-muted-foreground">No events found.</div>
          </Card>
        ) : (
          Object.entries(grouped).map(([date, dayEvents]) => {
            const d = new Date(date);
            const isToday = new Date().toDateString() === d.toDateString();
            const isPast = d < new Date(new Date().toDateString());
            return (
              <div key={date} className="animate-fade-in">
                {/* Date header */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border text-center leading-tight
                      ${isToday ? "bg-primary text-white border-primary shadow-md shadow-primary/30" : isPast ? "bg-surface-hover text-muted-foreground border-border" : "bg-background text-foreground border-border"}`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      {d.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-lg font-black leading-none">
                      {d.toLocaleDateString("en-US", { day: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
                      {isToday ? "Today" : d.toLocaleDateString("en-US", { weekday: "long" })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Events for this date */}
                <div className="ml-15 pl-3 border-l-2 border-border space-y-2 ml-6">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`flex items-start gap-4 p-4 rounded-xl bg-surface border border-border hover:bg-surface-hover transition-colors ${isPast ? "opacity-60" : ""}`}
                    >
                      <span
                        className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${TYPE_COLORS[evt.type] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {TYPE_LABELS[evt.type] ?? evt.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight">{evt.title}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          {evt.company && <span>{evt.company}</span>}
                          {evt.time && (
                            <>
                              <span>·</span>
                              <span>{evt.time}</span>
                            </>
                          )}
                          {evt.durationMins && (
                            <>
                              <span>·</span>
                              <span>{evt.durationMins}m</span>
                            </>
                          )}
                          {evt.location && (
                            <>
                              <span>·</span>
                              <span className="truncate">{evt.location}</span>
                            </>
                          )}
                        </div>
                        {evt.description && (
                          <p className="text-xs text-muted-foreground mt-1">{evt.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer
        ${active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-surface-hover text-muted-foreground border-border hover:text-foreground"
        }`}
    >
      {label}
    </button>
  );
}
