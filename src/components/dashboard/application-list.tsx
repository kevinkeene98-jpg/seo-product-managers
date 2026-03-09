"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSalary } from "@/lib/format";
import { useState } from "react";

interface Application {
  id: number;
  status: "active" | "applied" | "archived";
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  updatedAt: string | null;
  hasResume: boolean;
  hasCoverLetter: boolean;
}

interface Props {
  applications: Application[];
}

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  applied: "bg-green-100 text-green-700",
};

export function ApplicationList({ applications: initial }: Props) {
  const [applications, setApplications] = useState(initial);
  const [filter, setFilter] = useState<"all" | "active" | "applied">("all");
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const updateStatus = async (appId: number, status: "active" | "applied") => {
    await fetch("/api/dashboard/applications/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId, status }),
    });
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  };

  const deleteApplication = async (appId: number) => {
    await fetch("/api/dashboard/applications/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId }),
    });
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    setDeleteTarget(null);
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {(["all", "active", "applied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} ({f === "all" ? applications.length : applications.filter((a) => a.status === f).length})
          </button>
        ))}
      </div>

      {/* Application cards */}
      <div className="space-y-3">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between rounded-lg border bg-background p-4"
          >
            <div className="mr-4 hidden shrink-0 sm:block">
              {app.companyLogoUrl ? (
                <img
                  src={app.companyLogoUrl}
                  alt={app.companyName}
                  className="h-10 w-10 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                  {app.companyName.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold">{app.jobTitle}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[app.status] || ""}`}>
                  {app.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{app.companyName}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                {app.location && <span>{app.location}</span>}
                <span>{formatSalary(app.salaryMin, app.salaryMax)}</span>
                {app.hasResume && <Badge variant="outline" className="text-xs">Resume</Badge>}
                {app.hasCoverLetter && <Badge variant="outline" className="text-xs">Cover Letter</Badge>}
              </div>
              {app.updatedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last updated {new Date(app.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="ml-4 flex items-center gap-2">
              {app.status === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(app.id, "applied")}
                >
                  Mark Applied
                </Button>
              )}
              {app.status === "applied" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(app.id, "active")}
                >
                  Mark Active
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => setDeleteTarget(app)}
              >
                Delete
              </Button>
              <Link href={`/builder/${app.jobId}`}>
                <Button size="sm">Continue</Button>
              </Link>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {filter === "all" ? "" : filter} applications.
          </p>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Delete Application</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete your application for{" "}
              <strong>{deleteTarget.jobTitle}</strong> at{" "}
              <strong>{deleteTarget.companyName}</strong>? This will permanently
              remove your resume, cover letter, and chat history for this job.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteApplication(deleteTarget.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
