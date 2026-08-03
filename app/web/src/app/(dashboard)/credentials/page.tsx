import { getStudentCredentials } from "@/app/actions/credentials";
import CredentialsClient from "./CredentialsClient";
import { redirect } from "next/navigation";

export default async function CredentialsPage() {
  let credentials;
  try {
    credentials = await getStudentCredentials();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      redirect("/login");
    }
    // If it's another error (like db connection), we might want to show an error state
    throw error;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Credentials</h2>
      </div>
      <CredentialsClient initialCredentials={credentials} />
    </div>
  );
}
