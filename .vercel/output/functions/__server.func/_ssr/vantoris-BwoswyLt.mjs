import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vantoris-BwoswyLt.js
var import_jsx_runtime = require_jsx_runtime();
var AREAS = [
	["Purpose", "An independent private institution. It does not take deposits and it does not run Ashcombe's ledger."],
	["Governance", "Registers, approvals and delegation stay inside Vantoris."],
	["Workforce", "People are recorded as institutional profiles, not as bank customers."],
	["Research", "Intelligence and publications are institutional work, not investment advice from the bank."],
	["Compliance", "Obligations and risk are Vantoris's own. They are not the German banking tracker."],
	["Contact", "Enquiries reach Vantoris operators. They do not create Ashcombe accounts."]
];
function VantorisHome() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-navy text-ivory",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-5 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "font-display text-2xl",
					children: "Vantoris"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex flex-wrap justify-end gap-x-4 gap-y-2 text-sm text-slate",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/vantoris/enquire",
							children: "Enquire"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							search: {
								institution: "vantoris",
								next: "/vantoris/portal"
							},
							children: "Sign in"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/vantoris/portal",
							children: "Portal"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/vantoris/office",
							children: "Office"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/vantoris/disclosures",
							children: "Disclosures"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-3xl px-5 py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-widest text-brass",
						children: "Vantoris Private Institution"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-display text-5xl leading-tight",
						children: "Independent authority. Independent records."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-slate",
						children: "Heritage, research, workforce and governance. The visual system is navy and brass so it is not mistaken for Ashcombe."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/vantoris/enquire",
							className: "inline-flex min-h-11 items-center bg-brass px-6 text-sm text-navy",
							children: "Institutional enquiry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							search: {
								institution: "vantoris",
								next: "/vantoris/portal"
							},
							className: "inline-flex min-h-11 items-center border border-brass px-6 text-sm text-ivory",
							children: "Sign in"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto grid max-w-6xl gap-8 px-5 pb-16 md:grid-cols-3",
				children: AREAS.map(([title, copy]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "border-t border-brass pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-slate",
						children: copy
					})]
				}, title))
			})
		]
	});
}
//#endregion
export { VantorisHome as component };
