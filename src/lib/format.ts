export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNairaYear(amount: number): string {
  return `${formatNaira(amount)} / year`;
}

export function toWhatsAppDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

export function whatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${toWhatsAppDigits(phone)}?text=${encodeURIComponent(text)}`;
}

export function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "agent";
}

export function formatClosingKitWhatsAppMessage({
  buyerName,
  title,
  price,
  agencyFee = 0,
  legalFee = 0,
  cautionFee = 0,
  serviceCharge = 0,
  publicUrl,
}: {
  buyerName: string;
  title: string;
  price: number;
  agencyFee?: number;
  legalFee?: number;
  cautionFee?: number;
  serviceCharge?: number;
  publicUrl: string;
}): string {
  const rent = price || 0;
  const agency = agencyFee || 0;
  const legal = legalFee || 0;
  const caution = cautionFee || 0;
  const sc = serviceCharge || 0;
  const total = rent + agency + legal + caution + sc;

  return `Hello ${buyerName}, here is the verified move-in breakdown for ${title}:

🏡 Rent/Price: ₦${rent.toLocaleString()}
📋 Agency Fee: ₦${agency.toLocaleString()}
⚖️ Legal Fee: ₦${legal.toLocaleString()}
🛡️ Caution Deposit: ₦${caution.toLocaleString()}
🔧 Service Charge: ₦${sc.toLocaleString()}
----------------------------------
💰 Total Move-In Cost: ₦${total.toLocaleString()}

📍 View Photos & Details: ${publicUrl}

Let me know when you would like to schedule an in-person viewing!`;
}

export const RESERVED_SLUGS = new Set([
  "login",
  "signup",
  "dashboard",
  "api",
  "auth",
  "listings",
  "agents",
  "about",
  "terms",
  "privacy",
  "admin",
]);
