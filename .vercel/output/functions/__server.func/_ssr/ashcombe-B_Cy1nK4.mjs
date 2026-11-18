import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./public-shell-B_m1cjhE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ashcombe-B_Cy1nK4.js
var import_jsx_runtime = require_jsx_runtime();
var SECTIONS = [
	["Private banking", "Named relationships, multi-currency accounts and payment instructions under maker-checker control."],
	["Wealth", "Investment reporting sits beside the banking ledger. It does not move cash by itself."],
	["Treasury", "Currency positions are internal records until a scheme participant and settlement evidence exist."],
	["Governance", "Germany-readiness obligations stay open until evidence is filed and a different officer approves it."],
	["Leadership", "Officers appear only after the access register grants them a role. This page does not invent a board."],
	["Careers", "Roles are opened by the institution, not by a public application that creates authority."]
];
function AshcombeHome() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-5 py-20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-widest text-forest",
						children: "Ashcombe Private Bank"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-serif text-4xl leading-tight md:text-5xl",
						children: "A distinguished institution. Personal relationships. Modern banking."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-6 max-w-xl text-ink-muted",
						children: "Enquiries go to the operators responsible. They do not open an account. Due diligence is sent back only as a private link."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col justify-center gap-3 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/ashcombe/enquire",
								className: "inline-flex min-h-11 items-center justify-center bg-forest px-6 text-sm text-paper",
								children: "Private enquiry"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								search: {
									institution: "ashcombe",
									next: "/ashcombe/banking"
								},
								className: "inline-flex min-h-11 items-center justify-center border border-line-strong px-6 text-sm",
								children: "Sign in"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/ashcombe/banking",
								className: "inline-flex min-h-11 items-center justify-center border border-line-strong px-6 text-sm",
								children: "Client banking"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/ashcombe/disclosures",
								className: "inline-flex min-h-11 items-center justify-center border border-line-strong px-6 text-sm",
								children: "Disclosures"
							})
						]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-line px-5 py-14",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid max-w-5xl gap-8 md:grid-cols-3",
				children: SECTIONS.map(([title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-xl",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-ink-muted",
					children: copy
				})] }, title))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-line bg-paper-warm px-5 py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-3xl text-sm leading-relaxed text-charcoal",
				children: "Ashcombe is being established. No banking licence, deposit guarantee or live interbank rail is stated here. Payment settlement is recorded only when an officer attaches evidence and a different officer reconciles it against a funded ledger."
			})
		})
	] });
}
//#endregion
export { AshcombeHome as component };
