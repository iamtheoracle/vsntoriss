import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as vantorisHome, d as createVantorisRequest, g as postMessage } from "./platform.functions-BcjYjA7s.mjs";
import { h as fileComplaint, y as memberDesk } from "./registers.functions-BnTeEUd_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal-BZ4FB2nz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Portal() {
	const [home, setHome] = (0, import_react.useState)(null);
	const [desk, setDesk] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	async function refresh() {
		const next = await vantorisHome();
		setHome(next);
		if (next.member?.status === "active") setDesk(await memberDesk());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => {
			window.location.assign("/login?institution=vantoris&next=/vantoris/portal");
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-navy px-5 py-12 text-ivory",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/vantoris",
				className: "text-sm text-brass",
				children: "Vantoris"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl",
				children: "Institutional portal"
			}),
			!home ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: "Opening your profile…"
			}) : null,
			home && home.member?.status !== "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 max-w-xl text-sm text-slate",
				children: [
					"No active member profile. ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/access",
						className: "text-brass",
						children: "Request access"
					}),
					". Pending requests stay closed until an executive of Vantoris activates them."
				]
			}) : null,
			home && home.member?.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 max-w-2xl space-y-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-slate",
						children: [
							home.member.display_name,
							" · ",
							home.member.role
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-slate/30 border-y border-slate/30 text-sm",
						children: home.requests.map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-brass",
									children: request.status
								}),
								" · ",
								request.title,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-slate",
									children: request.body
								})
							]
						}, request.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-3",
						onSubmit: async (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							const result = await createVantorisRequest({ data: {
								title: String(form.get("title")),
								body: String(form.get("body"))
							} });
							if ("error" in result && result.error) setError(result.error);
							else {
								setError("");
								event.currentTarget.reset();
								await refresh();
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								name: "title",
								placeholder: "Request title",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "field",
								name: "body",
								rows: 4,
								placeholder: "What you are asking the institution to do",
								required: true
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-brass",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "min-h-11 bg-brass px-5 text-sm text-navy",
								type: "submit",
								children: "File request"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-3",
						onSubmit: async (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							await postMessage({ data: {
								institution: "vantoris",
								body: String(form.get("body"))
							} });
							event.currentTarget.reset();
							await refresh();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Messages"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "text-sm",
								children: home.thread.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: message.body }, message.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "field",
								name: "body",
								rows: 3,
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "min-h-11 border border-brass px-5 text-sm",
								type: "submit",
								children: "Send"
							})
						]
					}),
					desk && desk.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Records"
							}),
							desk.documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-slate",
								children: "No document has been filed for you."
							}) : null,
							desk.documents.map((document) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "border-t border-brass/40 pt-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: document.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 whitespace-pre-wrap text-slate",
									children: document.body
								})]
							}, document.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "pt-4 font-display text-2xl",
								children: "Released work"
							}),
							desk.publications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-slate",
								children: "None released."
							}) : null,
							desk.publications.map((paper) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm",
								children: [
									paper.title,
									" — ",
									paper.summary
								]
							}, paper.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "space-y-3 pt-4",
								onSubmit: async (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									const result = await fileComplaint({ data: {
										institution: "vantoris",
										subject: String(form.get("subject")),
										detail: String(form.get("detail"))
									} });
									setError("reference" in result && result.reference ? `Recorded ${result.reference}` : result.error ?? "");
									if ("reference" in result && result.reference) event.currentTarget.reset();
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-2xl",
										children: "Complaint"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "subject",
										placeholder: "Subject",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field text-ivory",
										name: "detail",
										rows: 3,
										placeholder: "What should be looked at",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-brass px-5 text-sm",
										type: "submit",
										children: "File"
									})
								]
							})
						]
					}) : null
				]
			}) : null
		]
	});
}
//#endregion
export { Portal as component };
