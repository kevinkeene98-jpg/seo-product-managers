import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) redirect("/");

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex">
        <BuilderSidebar />
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
