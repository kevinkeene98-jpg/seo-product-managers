import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "notifications@seoproductmanagers.com";

export async function sendJobAlertEmail(
  to: string,
  jobs: { title: string; company: string; url: string }[]
) {
  const jobList = jobs
    .map(
      (j) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee"><a href="${j.url}" style="color:#2563eb;text-decoration:none;font-weight:600">${j.title}</a><br/><span style="color:#666;font-size:14px">${j.company}</span></td></tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${jobs.length} new SEO product manager job${jobs.length > 1 ? "s" : ""} today`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#111">New Jobs on SEO Product Managers</h2>
        <p style="color:#666">Here are the latest jobs matching your alert:</p>
        <table style="width:100%;border-collapse:collapse">${jobList}</table>
        <p style="margin-top:24px;color:#999;font-size:12px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color:#999">Manage your alerts</a>
        </p>
      </div>
    `,
  });
}
