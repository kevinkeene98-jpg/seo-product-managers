"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LOCATION_FILTER_OPTIONS,
  WORK_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
} from "@/lib/constants";

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "" && value !== "all" && value !== "any") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleKeywordSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateFilter("q", keyword.trim());
    },
    [keyword, updateFilter]
  );

  const clearFilters = useCallback(() => {
    setKeyword("");
    router.push("/jobs");
  }, [router]);

  const hasFilters = searchParams.toString() !== "";

  return (
    <aside className="w-full space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Filters
      </h2>

      {/* Keyword Search */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Search</label>
        <form onSubmit={handleKeywordSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Job title, company..."
            className="flex-1"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button type="submit" size="sm">
            Go
          </Button>
        </form>
      </div>

      <Separator />

      {/* Location */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Location</label>
        <Select
          value={searchParams.get("location") || ""}
          onValueChange={(v) => updateFilter("location", v)}
        >
          <SelectTrigger className="w-full">
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
      <div>
        <label className="mb-1.5 block text-sm font-medium">Work Type</label>
        <Select
          value={searchParams.get("work_type") || ""}
          onValueChange={(v) => updateFilter("work_type", v)}
        >
          <SelectTrigger className="w-full">
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

      {/* Experience */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Experience</label>
        <Select
          value={searchParams.get("experience") || ""}
          onValueChange={(v) => updateFilter("experience", v)}
        >
          <SelectTrigger className="w-full">
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
      <div>
        <label className="mb-1.5 block text-sm font-medium">Min Salary</label>
        <Input
          type="number"
          placeholder="e.g. 100000"
          className="w-full"
          value={searchParams.get("salary_min") || ""}
          onChange={(e) => updateFilter("salary_min", e.target.value)}
        />
      </div>

      <Separator />

      {/* New Only */}
      <Button
        variant={searchParams.get("new_only") === "true" ? "default" : "outline"}
        size="sm"
        className="w-full"
        onClick={() =>
          updateFilter(
            "new_only",
            searchParams.get("new_only") === "true" ? "" : "true"
          )
        }
      >
        New Jobs Only
      </Button>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </aside>
  );
}
