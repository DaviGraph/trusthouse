import type { Listing } from "@/lib/types";

export async function downloadMoveInInvoicePDF({
  agentName,
  agentPhone,
  agentEmail,
  listing,
  publicUrl,
}: {
  agentName: string;
  agentPhone?: string;
  agentEmail?: string;
  listing: Listing;
  publicUrl?: string;
}) {
  if (typeof window === "undefined") return;

  // Dynamically import html2pdf.js (browser-only)
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const yearlyRent = listing.yearlyRent || 0;
  const agencyFee = listing.agencyFee || 0;
  const legalFee = listing.legalFee || 0;
  const cautionFee = listing.cautionFee || 0;
  const serviceCharge = listing.serviceCharge || 0;
  const total = yearlyRent + agencyFee + legalFee + cautionFee + serviceCharge;

  const dateStr = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const container = document.createElement("div");
  container.style.padding = "32px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#1c1917";
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.maxWidth = "800px";
  container.style.margin = "0 auto";

  container.innerHTML = `
    <div style="border-bottom: 2px solid #0f5c45; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 style="color: #0f5c45; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2;">TrustHouse</h1>
        <p style="color: #0f5c45; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 4px 0 0 0;">Verified Lagos Real Estate</p>
      </div>
      <div style="text-align: right;">
        <span style="background-color: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0; display: inline-block;">VERIFIED ESTIMATE</span>
        <p style="font-size: 12px; color: #666666; margin: 6px 0 0 0;">Date: ${dateStr}</p>
      </div>
    </div>

    <!-- Agent & Issuer Info -->
    <div style="background-color: #f5f5f4; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #0f5c45;">Agent / Representative Information</h3>
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1c1917;">${agentName}</p>
      ${agentPhone ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #57534e;">Phone / WhatsApp: ${agentPhone}</p>` : ""}
      ${agentEmail ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #57534e;">Email: ${agentEmail}</p>` : ""}
    </div>

    <!-- Property Details -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #1c1917; margin: 0 0 6px 0;">${listing.title}</h2>
      <p style="font-size: 13px; color: #57534e; margin: 0;">Location: <strong>${listing.area}, Lagos</strong> · ${listing.bedrooms} Bed / ${listing.bathrooms} Bath</p>
    </div>

    <!-- Fee Breakdown Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
      <thead>
        <tr style="background-color: #0f5c45; color: #ffffff; text-align: left;">
          <th style="padding: 10px 12px; font-weight: 600; border-top-left-radius: 6px;">Item Component</th>
          <th style="padding: 10px 12px; font-weight: 600; text-align: right; border-top-right-radius: 6px;">Amount (₦)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e7e5e4;">
          <td style="padding: 10px 12px; color: #1c1917;">Annual Rent</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #1c1917;">₦${yearlyRent.toLocaleString()}</td>
        </tr>
        ${
          agencyFee > 0
            ? `<tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 10px 12px; color: #1c1917;">Agency Fee</td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #1c1917;">₦${agencyFee.toLocaleString()}</td>
              </tr>`
            : ""
        }
        ${
          legalFee > 0
            ? `<tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 10px 12px; color: #1c1917;">Legal / Agreement Fee</td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #1c1917;">₦${legalFee.toLocaleString()}</td>
              </tr>`
            : ""
        }
        ${
          cautionFee > 0
            ? `<tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 10px 12px; color: #1c1917;">Refundable Caution Deposit</td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #1c1917;">₦${cautionFee.toLocaleString()}</td>
              </tr>`
            : ""
        }
        ${
          serviceCharge > 0
            ? `<tr style="border-bottom: 1px solid #e7e5e4;">
                <td style="padding: 10px 12px; color: #1c1917;">Service Charge</td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #1c1917;">₦${serviceCharge.toLocaleString()}</td>
              </tr>`
            : ""
        }
        <tr style="background-color: #f5f5f4; font-size: 15px;">
          <td style="padding: 12px; font-weight: 700; color: #0f5c45;">Total Move-In Cost</td>
          <td style="padding: 12px; text-align: right; font-weight: 700; color: #0f5c45;">₦${total.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <!-- Footer -->
    <div style="border-top: 1px solid #e7e5e4; pt-16; margin-top: 32px; font-size: 11px; color: #78716c; text-align: center;">
      ${publicUrl ? `<p style="margin: 0 0 4px 0;">Property Link: <a href="${publicUrl}" style="color: #0f5c45; text-decoration: underline;">${publicUrl}</a></p>` : ""}
      <p style="margin: 0; font-style: italic;">This document is a formal move-in cost estimate generated via TrustHouse.</p>
    </div>
  `;

  const filename = `TrustHouse-MoveIn-Estimate-${listing.title.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

  const opt = {
    margin: 10,
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  };

  await html2pdf().set(opt).from(container).save();
}
