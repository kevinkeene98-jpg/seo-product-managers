import { requireAuthUser } from "@/lib/auth";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import { AlertToggle } from "@/components/dashboard/alert-toggle";
import { db } from "@/db";
import { jobAlerts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export default async function SettingsPage() {
  const user = await requireAuthUser();

  const [alert] = await db
    .select()
    .from(jobAlerts)
    .where(and(eq(jobAlerts.userId, user.userId), eq(jobAlerts.active, true)))
    .limit(1);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="max-w-lg space-y-6">
        {/* Account Info */}
        <div className="rounded-lg border bg-background p-6">
          <h2 className="mb-4 text-lg font-semibold">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            {user.name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{user.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-lg border bg-background p-6">
          <h2 className="mb-4 text-lg font-semibold">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {user.subscriptionStatus === "active" ? "Pro Plan — $12/mo" : "Free Plan"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.subscriptionStatus === "active"
                  ? "Unlimited AI chat messages"
                  : "20 AI chat messages per day"}
              </p>
            </div>
            {user.subscriptionStatus !== "active" && <UpgradeButton />}
          </div>
        </div>
        {/* Email Alerts */}
        <div className="rounded-lg border bg-background p-6">
          <h2 className="mb-4 text-lg font-semibold">Job alerts</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily email digest</p>
              <p className="text-sm text-muted-foreground">
                Get notified when new SEO product manager jobs are posted.
              </p>
            </div>
            <AlertToggle initialSubscribed={!!alert} />
          </div>
        </div>
      </div>
    </div>
  );
}
