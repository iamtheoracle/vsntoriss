import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as submitEnquiry } from "./platform.functions-BcjYjA7s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/enquire-XfkuOp2f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Enquire() {
	const [done, setDone] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	async function onSubmit(event) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const result = await submitEnquiry({ data: {
			institution: "vantoris",
			fullName: String(form.get("fullName") ?? ""),
			email: String(form.get("email") ?? ""),
			country: String(form.get("country") ?? ""),
			topic: String(form.get("topic") ?? ""),
			message: String(form.get("message") ?? "")
		} });
		if ("error" in result && result.error) setError(result.error);
		else if ("reference" in result && result.reference) setDone(`${result.reference}. ${result.notice ?? ""}`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-navy px-5 py-14 text-ivory",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/vantoris",
				className: "text-sm text-brass",
				children: "Vantoris"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-4xl",
				children: "Institutional enquiry"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-slate",
				children: "Sent to Vantoris operators. It does not create a banking account."
			}),
			done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 max-w-xl text-sm",
				children: done
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mt-8 max-w-xl space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "fullName",
						placeholder: "Name",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "email",
						type: "email",
						placeholder: "Email",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "country",
						placeholder: "Jurisdiction",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "field",
						name: "topic",
						defaultValue: "Governance",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Governance" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Research" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Workforce" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Partnership" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "field",
						name: "message",
						rows: 6,
						required: true,
						placeholder: "The matter, without confidential third-party data"
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-brass",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 bg-brass px-6 text-sm text-navy",
						type: "submit",
						children: "Send to operators"
					})
				]
			})
		]
	});
}
//#endregion
export { Enquire as component };
