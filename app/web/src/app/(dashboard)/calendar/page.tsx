"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import CalendarTimeline from "@/components/calendar/CalendarTimeline";
import EventDetailsPanel from "@/components/calendar/EventDetailsPanel";
import { type CalendarEvent, type CalendarEventType } from "@/lib/mock-data";

export default function CalendarPage() {
  const { user } = useAuth();
  const { calendarEvents } = usePlacement();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const isFaculty = user?.role === "FACULTY";

  // Filter events based on user role
  const visibleEvents = calendarEvents.filter((evt) => {
    if (isFaculty) return true; // Faculty sees all placement schedules
    return evt.targetRole === "student" || evt.targetRole === "both";
  });

  const legendItems: { type: CalendarEventType; label: string; bgClass: string; textClass: string }[] = [
    { type: "interview", label: "Interview", bgClass: "bg-primary", textClass: "text-primary" },
    { type: "assessment", label: "Assessment", bgClass: "bg-warning", textClass: "text-warning" },
    { type: "offer-deadline", label: "Offer Deadline", bgClass: "bg-success", textClass: "text-success" },
    { type: "campus-drive", label: "Campus Drive", bgClass: "bg-purple-500", textClass: "text-purple-400" },
    { type: "placement-event", label: "Placement Event", bgClass: "bg-muted-foreground", textClass: "text-muted-foreground" },
  ];

  return (
    <>
      <Header
        title="Placement & Interview Calendar"
        subtitle={
          isFaculty
            ? "Campus recruitment schedule, online assessments & drive milestones"
            : "Keep track of your upcoming interviews, tests, and offer deadlines"
        }
      />

      <div className="p-6 space-y-6">
        {/* Color Legend Row */}
        <Card padding="sm" className="bg-surface/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Event Types Legend:
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {legendItems.map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.bgClass}`} />
                  <span className="text-xs font-semibold text-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Main Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Calendar Grid (Spans 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <CalendarTimeline
              events={visibleEvents}
              selectedEventId={selectedEvent?.id}
              onEventSelect={(evt) => setSelectedEvent(evt)}
            />
          </div>

          {/* Event Details Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-bold text-foreground">Event Details</h3>
              </div>

              {selectedEvent ? (
                <EventDetailsPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
              ) : (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted/20 text-muted-foreground mx-auto flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Select an event to view details
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
