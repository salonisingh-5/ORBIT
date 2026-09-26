export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  simulated?: boolean;
  id?: string;
  error?: string;
}

export interface DeadlineEmailContext {
  studentName: string;
  opportunityTitle: string;
  opportunitySlug: string;
  category: string;
  clubName: string;
  deadlineFormatted: string;
  deadlineCountdown: string;
  location?: string | null;
  officialUrl: string;
  orbitUrl: string;
}

/**
 * Checks whether a valid live Resend API key is configured.
 */
export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && !key.includes("placeholder") && !key.startsWith("re_placeholder"));
}

/**
 * Checks whether an opportunity deadline falls within the approaching reminder window (e.g. next 72 hours).
 */
export function isDeadlineApproaching(
  deadline: Date,
  windowHours: number = 72
): boolean {
  const now = Date.now();
  const deadlineTime = deadline.getTime();
  const diffMs = deadlineTime - now;

  return diffMs > 0 && diffMs <= windowHours * 60 * 60 * 1000;
}

/**
 * Dispatches an email via Resend API, with graceful mock simulation for development.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom =
    process.env.EMAIL_FROM || "ORBIT RVCE <notifications@orbit-rvce.edu.in>";
  const sender = from || defaultFrom;

  // Development fallback: simulate email when API key is missing or placeholder
  if (!isResendConfigured()) {
    console.log(
      `[Resend Simulated Dispatch]\n  To: ${to}\n  From: ${sender}\n  Subject: ${subject}\n  Length: ${html.length} chars`
    );
    return {
      success: true,
      simulated: true,
      id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [to],
        subject,
        html,
        text: text || "Opportunity deadline alert from ORBIT RVCE.",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Resend Error] API call failed:", res.status, errText);
      return {
        success: false,
        error: `Resend HTTP ${res.status}: ${errText}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      simulated: false,
      id: data.id,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Resend Error] Network dispatch exception:", message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Generates an editorial beige HTML email template matching Orbit's aesthetic.
 */
export function generateDeadlineReminderHtml(ctx: DeadlineEmailContext): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.opportunityTitle} - Deadline Approaching</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F0EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #241C15;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F5F0EB; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E6DED6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(36, 28, 21, 0.05);">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #FBF9F5; border-bottom: 1px solid #E6DED6; padding: 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #241C15; letter-spacing: -0.5px;">ORBIT</span>
                    <span style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8C827A; margin-top: 2px;">RV College of Engineering</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #FEF3C7; border: 1px solid #FDE68A; color: #92400E; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
                      ${ctx.deadlineCountdown}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #5C5248;">
                Hello ${ctx.studentName || "RVCE Student"},
              </p>
              
              <h1 style="margin: 0 0 12px 0; font-family: Georgia, serif; font-size: 24px; font-weight: bold; line-height: 1.3; color: #241C15;">
                ${ctx.opportunityTitle}
              </h1>

              <p style="margin: 0 0 24px 0; font-size: 13px; color: #8C827A;">
                Organized by <strong style="color: #241C15;">${ctx.clubName}</strong> &bull; <span style="text-transform: uppercase; font-weight: 600;">${ctx.category}</span>
              </p>

              <!-- Highlight Box -->
              <table role="presentation" width="100%" style="background-color: #FBF9F5; border: 1px solid #E6DED6; border-left: 4px solid #B89758; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #B45309; margin-bottom: 4px;">
                      Final Registration Deadline
                    </div>
                    <div style="font-size: 16px; font-weight: 700; color: #241C15; margin-bottom: 6px;">
                      ${ctx.deadlineFormatted}
                    </div>
                    ${ctx.location ? `<div style="font-size: 12px; color: #8C827A;">Venue: ${ctx.location}</div>` : ""}
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #5C5248;">
                You saved this opportunity to your personal ORBIT tracker. The registration window is closing soon. Ensure your team details and submissions are completed before the portal closes.
              </p>

              <!-- Actions -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="border-radius: 8px; background-color: #241C15;">
                    <a href="${ctx.orbitUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; font-size: 13px; font-weight: 700; color: #FBF9F5; text-decoration: none; border-radius: 8px;">
                      View Details on ORBIT &rarr;
                    </a>
                  </td>
                  <td style="padding-left: 12px;">
                    <a href="${ctx.officialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 20px; font-size: 13px; font-weight: 600; color: #241C15; background-color: #F5F0EB; text-decoration: none; border: 1px solid #E6DED6; border-radius: 8px;">
                      Official Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FBF9F5; border-top: 1px solid #E6DED6; padding: 20px 32px; text-align: center; font-size: 11px; color: #8C827A; line-height: 1.5;">
              This is an automated reminder sent to your verified <strong>@rvce.edu.in</strong> account.<br>
              ORBIT &bull; RV College of Engineering Student Opportunity Intelligence Hub
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
