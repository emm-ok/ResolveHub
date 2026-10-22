
import { Resend } from "resend";

interface SendCompanyInvitationEmailInput {
    to: string;
    companyName: string;
    roleName: string;
    invitationUrl: string;
    expiresAt: Date;
    inviterName?: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

function getResendClient(): Resend {
    if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not configured.");
    }

    return new Resend(resendApiKey);
}

/**
 * Escapes untrusted values before inserting them into HTML.
 */
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function sendCompanyInvitationEmail({
    to,
    companyName,
    roleName,
    invitationUrl,
    expiresAt,
    inviterName,
}: SendCompanyInvitationEmailInput): Promise<void> {
    if (!emailFrom) {
        throw new Error("EMAIL_FROM is not configured.");
    }

    // Ensure the acceptance link points to your trusted application.
    const appUrl = process.env.APP_URL;

    if (!appUrl) {
        throw new Error("APP_URL is not configured.");
    }

    const appOrigin = new URL(appUrl).origin;
    const invitation = new URL(invitationUrl);

    if (
        invitation.origin !== appOrigin ||
        invitation.protocol !== "https:" &&
        new URL(appOrigin).protocol === "https:"
    ) {
        throw new Error("Invalid company invitation URL.");
    }

    const safeCompanyName = escapeHtml(companyName);
    const safeRoleName = escapeHtml(roleName);
    const safeInviterName = inviterName
        ? escapeHtml(inviterName)
        : "A company administrator";

    const expiration = expiresAt.toLocaleString("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
    });

    const resend = getResendClient();

    const { error } = await resend.emails.send({
        from: emailFrom,
        to: [to],
        subject: `You're invited to join ${companyName} on ResolveHub`,
        text: [
            `Hello,`,
            ``,
            `${inviterName ?? "A company administrator"} has invited you to join ${companyName} on ResolveHub.`,
            `Role: ${roleName}`,
            ``,
            `Accept your invitation using this link:`,
            invitation.toString(),
            ``,
            `This invitation expires on ${expiration} UTC.`,
            ``,
            `If you were not expecting this invitation, you can ignore this email.`,
        ].join("\n"),
        html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>ResolveHub Company Invitation</title>
        </head>
        <body style="margin:0;padding:32px 16px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#171717;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:32px;">
            <h1 style="margin:0 0 24px;font-size:24px;">You're invited to ResolveHub</h1>

            <p style="font-size:15px;line-height:1.7;">
              ${safeInviterName} has invited you to join
              <strong>${safeCompanyName}</strong>.
            </p>

            <p style="font-size:15px;line-height:1.7;">
              Your assigned role:
              <strong>${safeRoleName}</strong>
            </p>

            <p style="margin:28px 0;">
              <a
                href="${escapeHtml(invitation.toString())}"
                style="display:inline-block;padding:14px 22px;background:#171717;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;"
              >
                Accept invitation
              </a>
            </p>

            <p style="font-size:13px;line-height:1.7;color:#525252;">
              This invitation expires on ${escapeHtml(expiration)} UTC.
            </p>

            <p style="font-size:13px;line-height:1.7;color:#525252;">
              If the button doesn't work, copy and paste this link into your browser:
              <br />
              <a href="${escapeHtml(invitation.toString())}" style="color:#404040;overflow-wrap:anywhere;">
                ${escapeHtml(invitation.toString())}
              </a>
            </p>

            <hr style="margin:28px 0;border:none;border-top:1px solid #e5e5e5;" />

            <p style="font-size:12px;line-height:1.6;color:#737373;">
              If you weren't expecting this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    });

    if (error) {
        // Do not log the invitation URL or raw token.
        console.error("Failed to send company invitation email:", {
            recipient: to,
            providerError: error.message,
        });

        throw new Error("Unable to send company invitation email.");
    }
}
