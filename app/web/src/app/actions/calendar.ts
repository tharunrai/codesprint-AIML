"use server";

// For now, returning static events since Calendar Event is not in the Prisma schema.
export async function getCalendarEvents() {
  return [
    {
      id: "evt-001",
      title: "TCS NQT — Online Assessment",
      type: "assessment",
      date: "2026-07-30",
      time: "10:00 AM",
      durationMins: 120,
      company: "Tata Consultancy Services",
      description: "National Qualifier Test for TCS Digital hiring.",
      location: "Online",
      targetRole: "both",
    },
    {
      id: "evt-002",
      title: "Google Campus Drive Arrival",
      type: "campus-drive",
      date: "2026-08-20",
      time: "09:30 AM",
      company: "Google",
      description: "Google HR & Technical recruitment team campus visit.",
      location: "Auditorium Main Complex",
      targetRole: "faculty",
    }
  ];
}
