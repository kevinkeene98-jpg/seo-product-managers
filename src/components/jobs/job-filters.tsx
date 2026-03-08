"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  LOCATION_FILTER_OPTIONS,
  WORK_TYPE_OPTIONS,
  JOB_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
} from "@/lib/constants";

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "" && value !== "all" && value !== "any") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset to page 1 on filter change
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/jobs");
  }, [router]);

  const hasFilters = searchParams.toString() !== "";

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Location */}
      <div className="w-full sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Location
        </label>
        <Select
          value={searchParams.get("location") || ""}
          onValueChange={(v) => updateFilter("location", v)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            {LOCATION_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Work Type */}
      <div className="w-full sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Work Type
        </label>
        <Select
          value={searchParams.get("work_type") || ""}
          onValueChange={(v) => updateFilter("work_type", v)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {WORK_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "any"} value={opt.value || "any"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Type */}
      <div className="w-full sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Job Type
        </label>
        <Select
          value={searchParams.get("job_type") || ""}
          onValueChange={(v) => updateFilter("job_type", v)}
        >
          <SelectTrigger className="w-full sm:w-[130px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {JOB_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experience */}
      <div className="w-full sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Experience
        </label>
        <Select
          value={searchParams.get("experience") || ""}
          onValueChange={(v) => updateFilter("experience", v)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Salary Min */}
      <div className="w-full sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Min Salary
        </label>
        <Input
          type="number"
          placeholder="e.g. 100000"
          className="w-full sm:w-[130px]"
          value={searchParams.get("salary_min") || ""}
          onChange={(e) => updateFilter("salary_min", e.target.value)}
        />
      </div>

      {/* New Only */}
      <div className="w-full sm:w-auto">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          &nbsp;
        </label>
        <Button
          variant={searchParams.get("new_only") === "true" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            updateFilter(
              "new_only",
              searchParams.get("new_only") === "true" ? "" : "true"
            )
          }
        >
          New Only
        </Button>
      </div>

      {/* Clear */}
      {hasFilters && (
        <div className="w-full sm:w-auto">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            &nbsp;
          </label>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
