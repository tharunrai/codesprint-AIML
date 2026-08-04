"use client";

import { type CalendarEvent, type CalendarEventType } from "@/lib/types";;
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface CalendarTimelineProps {
  events: CalendarEvent[];
  selectedEventId?: string;
  onEventSelect: (evt: CalendarEvent) => void;
}

export default function CalendarTimeline({
  events,
  selectedEventId,
  onEventSelect,
}: CalendarTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getTypeColor = (type: CalendarEventType) => {
    switch (type) {
      case "interview": return "bg-primary";
      case "assessment": return "bg-warning";
      case "offer-deadline": return "bg-success";
      case "campus-drive": return "bg-purple-500";
      case "placement-event": return "bg-muted-foreground";
      default: return "bg-primary";
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <Card className="py-16 text-center space-y-3">
        <p className="text-muted-foreground">No upcoming events on the timeline.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEvents.map((evt) => {
        const dateObj = new Date(evt.date);
        const day = dateObj.toLocaleDateString("en-US", { day: "numeric" });
        const month = dateObj.toLocaleDateString("en-US", { month: "short" });
        const isSelected = selectedEventId === evt.id;

        return (
          <div
            key={evt.id}
            onClick={() => onEventSelect(evt)}
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
              isSelected 
                ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" 
                : "bg-surface border-border hover:bg-surface-hover"
            }`}
          >
            <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-[3.5rem] bg-background rounded-lg border border-border shadow-sm">
              <span className="text-[10px] font-bold text-primary uppercase">{month}</span>
              <span className="text-lg font-black leading-none text-foreground mt-0.5">{day}</span>
            </div>

            <div className="flex-1 space-y-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${getTypeColor(evt.type)}`} />
                <h4 className="font-bold text-foreground leading-tight">
                  {evt.title}
                </h4>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {evt.company} {evt.time ? `• ${evt.time}` : ""} {evt.location ? `• ${evt.location}` : ""}
              </p>
            </div>

            <Badge variant={isSelected ? "info" : "default"} size="sm" className="hidden sm:inline-flex capitalize">
              {evt.type.replace("-", " ")}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
