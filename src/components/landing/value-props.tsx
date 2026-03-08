import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const props = [
  {
    title: "Curated Job Board",
    description:
      "Daily-updated listings from Google Jobs, filtered for SEO and growth product roles across Remote, New York, and Colorado.",
    badge: null,
  },
  {
    title: "AI Resume Builder",
    description:
      "Upload your resume and get AI-powered suggestions tailored to each specific job posting.",
    badge: "Coming Soon",
  },
  {
    title: "Application Tracker",
    description:
      "Track your applications, save tailored resumes, and manage your job search in one place.",
    badge: "Coming Soon",
  },
];

export function ValueProps() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {props.map((prop) => (
          <Card key={prop.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{prop.title}</CardTitle>
                {prop.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {prop.badge}
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-2">
                {prop.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
