import { Separator } from "@/components/ui/separator";
import type { Job } from "@/lib/types";

interface JobDescriptionProps {
  job: Job;
}

export function JobDescription({ job }: JobDescriptionProps) {
  const highlights = job.highlights as
    | Array<{ title: string; items: string[] }>
    | null;

  return (
    <div className="space-y-8">
      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div className="space-y-6">
          {highlights.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <Separator />
        </div>
      )}

      {/* Full Description */}
      <div>
        <h3 className="text-lg font-semibold">Full Description</h3>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </div>
      </div>
    </div>
  );
}
