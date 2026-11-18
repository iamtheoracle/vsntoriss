import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as getAccess, s as bootstrapExecutive, x as requestProfile } from "./platform.functions-BcjYjA7s.mjs";
import { t as UserButton } from "./gates-vdIU0DbP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-B-iCZ7Vf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Access() {
	const [state, setState] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	async function refresh() {
		setState(await getAccess());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => {
			window.location.assign("/login");
		});
	}, []);
	async function found(institution) {
		setError("");
		const result = await bootstrapExecutive({ data: {
			institution,
			displayName: name
		} });
		if ("error" in result && result.error) setError(result.error);
		await refresh();
	}
	async function ask(institution) {
		setError("");
		const result = await requestProfile({ data: {
			institution,
			displayName: name
		} });
		if ("error" in result && result.error) setError(result.error);
		await refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-5 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-forest",
					children: "Identity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Your profiles"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-ink-muted",
				children: "Signing in does not make you a client, a member, or an officer. Each institution grants that separately."
			}),
			!state ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-charcoal",
				children: "Reading the access register…"
			}) : null,
			state ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-8 divide-y divide-line border-y border-line",
				children: [state.profiles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-4 text-sm text-charcoal",
					children: "No institutional profile yet."
				}) : null, state.profiles.map((profile) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						profile.display_name,
						" · ",
						profile.institution,
						" · ",
						profile.kind,
						" · ",
						profile.role
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "uppercase tracking-widest text-forest",
						children: profile.status
					})]
				}, profile.id))]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-8 block text-sm",
				children: ["Name used on the register", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					value: name,
					onChange: (event) => setName(event.target.value)
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-amber",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-line-strong px-4 text-sm",
						onClick: () => ask("ashcombe"),
						children: "Request Ashcombe client profile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 border border-line-strong px-4 text-sm",
						onClick: () => ask("vantoris"),
						children: "Request Vantoris member profile"
					}),
					state?.vacancies.ashcombe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 bg-forest px-4 text-sm text-paper",
						onClick: () => found("ashcombe"),
						children: "Establish first Ashcombe executive"
					}) : null,
					state?.vacancies.vantoris ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 bg-navy px-4 text-sm text-ivory",
						onClick: () => found("vantoris"),
						children: "Establish first Vantoris executive"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs leading-relaxed text-charcoal",
				children: "The founding-executive action exists only while that institution has none. It is written to the audit register and then closes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap gap-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/ashcombe/banking",
						className: "text-forest",
						children: "Ashcombe banking"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/ashcombe/office",
						className: "text-forest",
						children: "Ashcombe office"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/vantoris/portal",
						className: "text-navy",
						children: "Vantoris portal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/vantoris/office",
						className: "text-navy",
						children: "Vantoris office"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/security",
						className: "text-forest",
						children: "Security"
					})
				]
			})
		]
	});
}
//#endregion
export { Access as component };
