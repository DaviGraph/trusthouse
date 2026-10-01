/**
 * Email Notification Service via Resend API
 * Uses process.env.RESEND_API or process.env.RESEND_API_KEY
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[Email Notification] RESEND_API / RESEND_API_KEY not configured. Skipping email to:", to);
    return { success: false, error: "RESEND_API key not configured" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "TrustHouse <notifications@trusthouse.ng>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: res.statusText }));
      console.error("[Email Notification Error]", errData);
      return { success: false, error: JSON.stringify(errData) };
    }

    const data = (await res.json()) as { id: string };
    console.log(`[Email Sent] To: ${to} | Subject: "${subject}" | ID: ${data.id}`);
    return { success: true, id: data.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send email";
    console.error("[Email Notification Exception]", msg);
    return { success: false, error: msg };
  }
}

/** 1. Welcome Notification on Signup */
export async function sendWelcomeEmail(toEmail: string, name: string) {
  return sendEmail({
    to: toEmail,
    subject: "Welcome to TrustHouse!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0f5c45;">Welcome to TrustHouse, ${name}! 🎉</h2>
        <p>Your agent account has been created successfully.</p>
        <p>You can now log in, set up your profile, and list your verified properties in Lagos.</p>
        <br/>
        <p style="color: #666; font-size: 0.9em;">TrustHouse Real Estate Team</p>
      </div>
    `,
  });
}

/** 2. New Inquiry Notification for Agent */
export async function sendInquiryNotificationEmail(
  agentEmail: string,
  agentName: string,
  buyerName: string,
  buyerPhone: string,
  listingTitle: string,
  message: string,
) {
  return sendEmail({
    to: agentEmail,
    subject: `New Lead: Inquiry for "${listingTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h3 style="color: #0f5c45;">Hi ${agentName}, you have a new inquiry! 🏡</h3>
        <p>A prospective client is interested in your listing: <strong>${listingTitle}</strong></p>
        <div style="background: #f5f5f4; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Buyer Name:</strong> ${buyerName}</p>
          <p style="margin: 5px 0;"><strong>Phone / WhatsApp:</strong> ${buyerPhone}</p>
          ${message ? `<p style="margin: 5px 0;"><strong>Message:</strong> "${message}"</p>` : ""}
        </div>
        <p>Please respond to this buyer directly or check your TrustHouse dashboard.</p>
      </div>
    `,
  });
}

/** 3. Client Review Notification for Agent */
export async function sendClientReviewEmail(
  agentEmail: string,
  agentName: string,
  clientName: string,
  rating: number,
  title: string,
  comment: string,
) {
  return sendEmail({
    to: agentEmail,
    subject: `New ${rating}-Star Client Review Received! ⭐`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h3 style="color: #0f5c45;">Hi ${agentName}, a client left a review for you!</h3>
        <p><strong>${clientName}</strong> gave you a <strong>${rating}/5 star</strong> review.</p>
        <div style="background: #f5f5f4; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4 style="margin-top: 0;">"${title}"</h4>
          <p style="margin-bottom: 0;">${comment}</p>
        </div>
        <p>Visit your profile to view your client feedback.</p>
      </div>
    `,
  });
}

/** 4. ID Verification Notification for Agent */
export async function sendIdVerificationEmail(
  agentEmail: string,
  agentName: string,
  status: "verified" | "not_submitted" | "pending_review",
  rejectionReason?: string,
) {
  const isApproved = status === "verified";
  const subject = isApproved
    ? "Government ID Verified! Verified Badge Activated 🎉"
    : "TrustHouse Government ID Verification Status Update";

  return sendEmail({
    to: agentEmail,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h3 style="color: #0f5c45;">Hi ${agentName},</h3>
        ${
          isApproved
            ? `<p>Great news! Your government ID has been reviewed and <strong>APPROVED</strong> by TrustHouse administrators.</p>
               <p>Your profile and published listings now display the <strong>Verified Agent</strong> badge!</p>`
            : `<p>Your government ID submission status is updated to: <strong>${status.replace("_", " ").toUpperCase()}</strong>.</p>
               ${rejectionReason ? `<p style="color: #d97706;"><strong>Reason:</strong> ${rejectionReason}</p>` : ""}
               <p>Please log into your dashboard profile to review or resubmit your document if required.</p>`
        }
      </div>
    `,
  });
}

/** 5. Listing Approval / Status Update Notification */
export async function sendListingStatusEmail(
  agentEmail: string,
  agentName: string,
  listingTitle: string,
  moderationStatus: string,
  isFeatured?: boolean,
) {
  return sendEmail({
    to: agentEmail,
    subject: `Listing Status Update: "${listingTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h3 style="color: #0f5c45;">Hi ${agentName},</h3>
        <p>Your listing <strong>"${listingTitle}"</strong> status has been updated by TrustHouse administrators.</p>
        <ul>
          <li><strong>Moderation Status:</strong> ${moderationStatus.toUpperCase()}</li>
          ${isFeatured !== undefined ? `<li><strong>Featured Status:</strong> ${isFeatured ? "Featured on homepage" : "Standard"}</li>` : ""}
        </ul>
        <p>Log in to your dashboard to view your active properties.</p>
      </div>
    `,
  });
}
