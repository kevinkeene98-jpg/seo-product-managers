"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BuilderTab } from "@/lib/types/resume";

interface Props {
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
}

export function TabBar({ activeTab, onTabChange }: Props) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as BuilderTab)}
      className="w-full"
    >
      <TabsList className="w-full justify-start">
        <TabsTrigger value="resume">Resume</TabsTrigger>
        <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
        <TabsTrigger value="qa">Q&A</TabsTrigger>
        <TabsTrigger
          value="job-description"
          className="ml-auto border-l border-border pl-3 text-muted-foreground"
        >
          Job Description
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
