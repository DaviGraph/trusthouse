//#region node_modules/.nitro/vite/services/ssr/assets/format-B_1iMEnz.js
function formatNaira(amount) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0
	}).format(amount);
}
function formatNairaYear(amount) {
	return `${formatNaira(amount)} / year`;
}
function toWhatsAppDigits(phone) {
	const digits = phone.replace(/\D/g, "");
	if (digits.startsWith("234")) return digits;
	if (digits.startsWith("0")) return `234${digits.slice(1)}`;
	return digits;
}
function whatsappUrl(phone, text) {
	return `https://wa.me/${toWhatsAppDigits(phone)}?text=${encodeURIComponent(text)}`;
}
function slugifyName(name) {
	return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "agent";
}
var RESERVED_SLUGS = /* @__PURE__ */ new Set([
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
	"admin"
]);
//#endregion
export { whatsappUrl as i, formatNairaYear as n, slugifyName as r, RESERVED_SLUGS as t };
