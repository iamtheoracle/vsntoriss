import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as UserButton } from "./gates-vdIU0DbP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C6QwiD4P.js
var import_jsx_runtime = require_jsx_runtime();
function Gateway() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-5 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-charcoal",
					children: "Two institutions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/ashcombe",
					className: "border border-line bg-paper-warm p-8 hover:border-forest",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-forest",
							children: "Institution one"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-serif text-4xl",
							children: "Ashcombe Private Bank"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm leading-relaxed text-ink-muted",
							children: "Private banking, wealth, treasury and the controlled financial ledger. Independent records. Independent authority."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/vantoris",
					className: "bg-navy p-8 text-ivory hover:bg-navy-deep",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-brass",
							children: "Institution two"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-display text-5xl",
							children: "Vantoris Private Institution"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm leading-relaxed text-slate",
							children: "Governance, workforce, research and institutional administration. Not a bank, and not a copy of Ashcombe."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto max-w-6xl px-5 pb-12 text-xs leading-relaxed text-charcoal",
				children: "Sign in on the institution itself. An Ashcombe sign-in stays on Ashcombe. A Vantoris sign-in stays on Vantoris. Google and X are not offered. No group headquarters sits above either institution. Banking authorisation is not claimed by this platform. Germany-readiness obligations remain open until evidence is reviewed."
			})
		]
	});
}
//#endregion
export { Gateway as component };
