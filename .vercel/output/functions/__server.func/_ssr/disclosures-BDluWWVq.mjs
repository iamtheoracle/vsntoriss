import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as publicPublications } from "./registers.functions-BnTeEUd_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/disclosures-BDluWWVq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Disclosures() {
	const [papers, setPapers] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		publicPublications({ data: "vantoris" }).then(setPapers).catch(() => setPapers([]));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-navy px-5 py-14 text-ivory",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "mx-auto max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/vantoris",
					className: "text-sm text-brass",
					children: "Vantoris"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-5xl",
					children: "Disclosures"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 space-y-6 text-sm leading-relaxed text-slate",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Vantoris Private Institution is independent of Ashcombe Private Bank. It does not take deposits, issue cards, run payments or hold client funds." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Shared sign-in does not share authority. A Vantoris profile cannot see the Ashcombe ledger, and an Ashcombe profile cannot administer Vantoris." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "There is no group headquarters above the two institutions. Enquiries reach Vantoris operators and do not create an account." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Institutional obligations start open. They are not a banking licence and they are not the German readiness list." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-12 font-display text-3xl",
					children: "Released work"
				}),
				papers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-slate",
					children: "None released."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-4",
					children: papers.map((paper) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-2xl text-ivory",
						children: paper.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-slate",
						children: paper.summary
					})] }, paper.title))
				})
			]
		})
	});
}
//#endregion
export { Disclosures as component };
