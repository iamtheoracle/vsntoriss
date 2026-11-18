import { o as __toESM } from "./_runtime.mjs";
import { S as require_jsx_runtime, X as require_react } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as Route$7 } from "./_ssr/router-CkdlM3Cw.mjs";
import { w as submitKyc, y as readKycInvite } from "./_ssr/platform.functions-BcjYjA7s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_token-BnNb-FPg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Kyc() {
	const { token } = Route$7.useParams();
	const [state, setState] = (0, import_react.useState)("loading");
	const [reference, setReference] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		readKycInvite({ data: token }).then((result) => {
			if (result.state === "open") {
				setState("open");
				setReference(result.reference);
			} else setState("closed");
		});
	}, [token]);
	async function onSubmit(event) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const result = await submitKyc({ data: {
			token,
			legalName: String(form.get("legalName") ?? ""),
			dateOfBirth: String(form.get("dateOfBirth") ?? ""),
			nationality: String(form.get("nationality") ?? ""),
			residence: String(form.get("residence") ?? ""),
			sourceOfFunds: String(form.get("sourceOfFunds") ?? "")
		} });
		if ("error" in result && result.error) setError(result.error);
		else setState("done");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-xl px-5 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-forest",
				children: "Ashcombe due diligence"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Private invitation"
			}),
			state === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: "Checking the link…"
			}) : null,
			state === "closed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-amber",
				children: "This link is closed. It cannot be used to register."
			}) : null,
			state === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm leading-relaxed",
				children: "Received. This does not open an account. A member of staff will contact you."
			}) : null,
			state === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mt-8 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-ink-muted",
						children: [
							"Enquiry ",
							reference,
							". Complete this only if Ashcombe sent you the link."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "legalName",
						placeholder: "Legal name",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "dateOfBirth",
						placeholder: "Date of birth",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "nationality",
						placeholder: "Nationality",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						name: "residence",
						placeholder: "Country of residence",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "field",
						name: "sourceOfFunds",
						rows: 5,
						placeholder: "Source of funds, in outline",
						required: true
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-amber",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 bg-forest px-6 text-sm text-paper",
						type: "submit",
						children: "Submit to compliance"
					})
				]
			}) : null
		]
	});
}
//#endregion
export { Kyc as component };
