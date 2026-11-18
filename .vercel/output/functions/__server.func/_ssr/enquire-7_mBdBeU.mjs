import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as submitEnquiry } from "./platform.functions-BcjYjA7s.mjs";
import { t as PublicShell } from "./public-shell-B_m1cjhE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/enquire-7_mBdBeU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Enquire() {
	const [notice, setNotice] = (0, import_react.useState)("");
	const [reference, setReference] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	async function onSubmit(event) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const result = await submitEnquiry({ data: {
			institution: "ashcombe",
			fullName: String(form.get("fullName") ?? ""),
			email: String(form.get("email") ?? ""),
			country: String(form.get("country") ?? ""),
			topic: String(form.get("topic") ?? ""),
			message: String(form.get("message") ?? "")
		} });
		if ("error" in result && result.error) {
			setError(result.error);
			return;
		}
		if ("reference" in result && result.reference) {
			setReference(result.reference);
			setNotice(result.notice ?? "");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-xl px-5 py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-forest",
				children: "Operators only"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Private enquiry"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm leading-relaxed text-ink-muted",
				children: "This form does not create an account and it is not a public KYC register. The operators in charge receive it. A member of staff will contact you."
			}),
			reference ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 border border-line bg-paper-warm p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-serif text-2xl",
					children: reference
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed",
					children: notice
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mt-8 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "fullName",
						placeholder: "Full name",
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
						placeholder: "Country of residence",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "field",
						name: "topic",
						required: true,
						defaultValue: "Private banking",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Private banking" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Wealth" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Treasury" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Institutional" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "field",
						name: "message",
						rows: 6,
						placeholder: "What relationship are you asking the operators to consider?",
						required: true
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-amber",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 bg-forest px-6 text-sm text-paper",
						type: "submit",
						children: "Send to operators"
					})
				]
			})
		]
	}) });
}
//#endregion
export { Enquire as component };
