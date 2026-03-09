import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/");

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <DashboardSidebar userName={user.name || user.email} />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
