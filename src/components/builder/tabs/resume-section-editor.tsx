"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import type { ResumeData, ExperienceEntry, EducationEntry } from "@/lib/types/resume";

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeSectionEditor({ data, onChange }: Props) {
  const update = useCallback(
    (partial: Partial<ResumeData>) => onChange({ ...data, ...partial }),
    [data, onChange]
  );

  const updateContact = useCallback(
    (field: string, value: string) =>
      update({ contactInfo: { ...data.contactInfo, [field]: value } }),
    [data, update]
  );

  const updateExperience = useCallback(
    (index: number, partial: Partial<ExperienceEntry>) => {
      const exp = [...data.experience];
      exp[index] = { ...exp[index], ...partial };
      update({ experience: exp });
    },
    [data, update]
  );

  const updateBullet = useCallback(
    (expIndex: number, bulletIndex: number, value: string) => {
      const exp = [...data.experience];
      const bullets = [...exp[expIndex].bullets];
      bullets[bulletIndex] = value;
      exp[expIndex] = { ...exp[expIndex], bullets };
      update({ experience: exp });
    },
    [data, update]
  );

  const addBullet = useCallback(
    (expIndex: number) => {
      const exp = [...data.experience];
      exp[expIndex] = { ...exp[expIndex], bullets: [...exp[expIndex].bullets, ""] };
      update({ experience: exp });
    },
    [data, update]
  );

  const removeBullet = useCallback(
    (expIndex: number, bulletIndex: number) => {
      const exp = [...data.experience];
      const bullets = exp[expIndex].bullets.filter((_, i) => i !== bulletIndex);
      exp[expIndex] = { ...exp[expIndex], bullets };
      update({ experience: exp });
    },
    [data, update]
  );

  const addExperience = useCallback(() => {
    update({
      experience: [
        ...data.experience,
        { id: nanoid(8), title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] },
      ],
    });
  }, [data, update]);

  const removeExperience = useCallback(
    (index: number) => {
      update({ experience: data.experience.filter((_, i) => i !== index) });
    },
    [data, update]
  );

  const updateEducation = useCallback(
    (index: number, partial: Partial<EducationEntry>) => {
      const edu = [...data.education];
      edu[index] = { ...edu[index], ...partial };
      update({ education: edu });
    },
    [data, update]
  );

  const addEducation = useCallback(() => {
    update({
      education: [
        ...data.education,
        { id: nanoid(8), degree: "", institution: "", graduationDate: "" },
      ],
    });
  }, [data, update]);

  const removeEducation = useCallback(
    (index: number) => {
      update({ education: data.education.filter((_, i) => i !== index) });
    },
    [data, update]
  );

  return (
    <div className="space-y-6 p-4">
      {/* Contact Info */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contact Information
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Full Name" value={data.contactInfo.name} onChange={(e) => updateContact("name", e.target.value)} />
          <Input placeholder="Email" value={data.contactInfo.email} onChange={(e) => updateContact("email", e.target.value)} />
          <Input placeholder="Phone" value={data.contactInfo.phone} onChange={(e) => updateContact("phone", e.target.value)} />
          <Input placeholder="Location" value={data.contactInfo.location} onChange={(e) => updateContact("location", e.target.value)} />
          <Input placeholder="LinkedIn (optional)" value={data.contactInfo.linkedin || ""} onChange={(e) => updateContact("linkedin", e.target.value)} />
          <Input placeholder="Portfolio (optional)" value={data.contactInfo.portfolio || ""} onChange={(e) => updateContact("portfolio", e.target.value)} />
        </div>
      </section>

      {/* Summary */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Summary
        </h3>
        <Textarea
          rows={3}
          placeholder="Professional summary..."
          value={data.summary}
          onChange={(e) => update({ summary: e.target.value })}
        />
      </section>

      {/* Experience */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Experience
          </h3>
          <Button variant="outline" size="sm" onClick={addExperience}>
            + Add
          </Button>
        </div>
        {data.experience.map((exp, i) => (
          <div key={exp.id} className="mb-4 rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Position {i + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeExperience(i)}>
                Remove
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Title" value={exp.title} onChange={(e) => updateExperience(i, { title: e.target.value })} />
              <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, { company: e.target.value })} />
              <Input placeholder="Location" value={exp.location} onChange={(e) => updateExperience(i, { location: e.target.value })} />
              <div className="flex gap-2">
                <Input placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExperience(i, { startDate: e.target.value })} />
                <Input placeholder="End Date" value={exp.endDate} onChange={(e) => updateExperience(i, { endDate: e.target.value })} />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {exp.bullets.map((bullet, j) => (
                <div key={j} className="flex gap-1">
                  <span className="mt-2.5 text-muted-foreground">•</span>
                  <Input
                    value={bullet}
                    onChange={(e) => updateBullet(i, j, e.target.value)}
                    placeholder="Accomplishment or responsibility..."
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeBullet(i, j)} className="shrink-0">
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => addBullet(i)} className="text-xs">
                + Add Bullet
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* Education */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Education
          </h3>
          <Button variant="outline" size="sm" onClick={addEducation}>
            + Add
          </Button>
        </div>
        {data.education.map((edu, i) => (
          <div key={edu.id} className="mb-3 rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Education {i + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeEducation(i)}>
                Remove
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} />
              <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, { institution: e.target.value })} />
              <Input placeholder="Graduation Date" value={edu.graduationDate} onChange={(e) => updateEducation(i, { graduationDate: e.target.value })} />
              <Input placeholder="GPA (optional)" value={edu.gpa || ""} onChange={(e) => updateEducation(i, { gpa: e.target.value })} />
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Skills
        </h3>
        <Textarea
          rows={2}
          placeholder="Comma-separated skills..."
          value={data.skills.join(", ")}
          onChange={(e) =>
            update({
              skills: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </section>
    </div>
  );
}
