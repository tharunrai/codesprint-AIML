import { getStudentCredentials } from "@/app/actions/credentials";
import CredentialsClient from "./CredentialsClient";

export default async function CredentialsPage() {
  const credentials = await getStudentCredentials();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Credentials</h2>
      </div>
      <CredentialsClient initialCredentials={credentials} />
    </div>
  );
}
