"use server";

// For now, returning static offers since Offer Letter is not in the Prisma schema.
// A full implementation would add an Offer model and fetch it.
export async function getOfferLetters() {
  return [
    {
      id: "off-001",
      studentId: "stu-001",
      studentName: "Arjun Mehta",
      rollNumber: "21CS048",
      branch: "CSE",
      driveId: "drv-002",
      companyName: "Microsoft",
      role: "Software Engineer",
      packageLPA: 42,
      location: "Bengaluru, India",
      offerDate: "2026-07-28T00:00:00Z",
      status: "verified",
    }
  ];
}
