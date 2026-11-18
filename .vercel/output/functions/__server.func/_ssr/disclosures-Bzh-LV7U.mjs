import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./public-shell-B_m1cjhE.mjs";
import { S as publicPublications } from "./registers.functions-BnTeEUd_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/disclosures-Bzh-LV7U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Disclosures() {
	const [papers, setPapers] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		publicPublications({ data: "ashcombe" }).then(setPapers).catch(() => setPapers([]));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mx-auto max-w-3xl px-5 py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-forest",
				children: "Ashcombe Private Bank"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Disclosures"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-6 text-sm leading-relaxed text-charcoal",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ashcombe is being established as an independent private bank on this platform. A banking licence, deposit guarantee and live interbank connection are not claimed, because none has been verified." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Germany is the first readiness perimeter. Thirteen obligations remain open until evidence is filed and a different officer approves it. Switzerland is a later workstream and is not open." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "An enquiry does not open an account. Due diligence is a private link. Staff contact the applicant. Payment instructions settle only when evidence exists, a different officer reconciles them, and the posted ledger can fund them." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Card requests, where accepted, are internal records. They do not create a PAN or contact a card scheme." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Careers are not a public registration. Authority is appointed by an executive onto an existing sign-in, never by the applicant. Officer actions also require a second factor on that session." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-12 font-serif text-2xl",
				children: "Released publications"
			}),
			papers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-charcoal",
				children: "None released."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-4",
				children: papers.map((paper) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-serif text-xl",
					children: paper.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-charcoal",
					children: paper.summary
				})] }, paper.title))
			})
		]
	}) });
}
//#endregion
export { Disclosures as component };
