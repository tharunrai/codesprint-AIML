import { getStudentProfileAndCredentials } from "@/app/actions/credentials";
import CredentialsClient from "./CredentialsClient";

export default async function CredentialsPage() {
  let studentData = { student: null as any, credentials: [] as any[] };

  try {
    studentData = await getStudentProfileAndCredentials();
  } catch (error: any) {
    console.warn("Could not load credentials server-side:", error?.message);
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Academic Credential Vault</h2>
      </div>
      <CredentialsClient 
        initialCredentials={studentData.credentials} 
        studentInfo={studentData.student}
      />
    </div>
  );
}
