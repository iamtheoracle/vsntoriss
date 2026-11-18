import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as vantorisOffice, S as setRequestStatus, f as decideProfile, t as addVantorisRisk } from "./platform.functions-BcjYjA7s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/office-zNEaVdnA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Office() {
	const [office, setOffice] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	async function refresh() {
		setOffice(await vantorisOffice());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => {
			window.location.assign("/login?institution=vantoris&next=/vantoris/office");
		});
	}, []);
	async function run(action) {
		const result = await action();
		setError(result.error ?? "");
		await refresh();
	}
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
				children: "Institutional office"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-brass",
				children: error
			}) : null,
			!office ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: "Opening the register…"
			}) : null,
			office && !office.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: office.stepUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					office.stepUp,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/security",
						className: "text-brass",
						children: "Security"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["No Vantoris staff profile. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/access",
					className: "text-brass",
					children: "Access"
				})] })
			}) : null,
			office && office.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 max-w-3xl space-y-10 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-slate",
						children: [
							"Role ",
							office.role,
							". No Ashcombe account, IBAN or payment control is available here. ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/vantoris/registers",
								className: "text-brass",
								children: "Registers"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "People"
					}), office.people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex justify-between border-b border-slate/30 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							person.display_name,
							" · ",
							person.kind,
							" · ",
							person.status
						] }), person.status === "pending" && person.user_id !== office.self ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-brass",
							onClick: () => run(() => decideProfile({ data: {
								profileId: person.id,
								decision: "active"
							} })),
							children: "Activate"
						}) : null]
					}, person.id))] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Requests"
					}), office.requests.map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "border-b border-slate/30 py-2",
						children: [
							request.title,
							" · ",
							request.status,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ml-3 text-brass",
								onClick: () => run(() => setRequestStatus({ data: {
									requestId: request.id,
									status: "in_progress"
								} })),
								children: "Progress"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ml-3 text-brass",
								onClick: () => run(() => setRequestStatus({ data: {
									requestId: request.id,
									status: "closed"
								} })),
								children: "Close"
							})
						]
					}, request.id))] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Enquiries"
					}), office.enquiries.map((enquiry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "border-b border-slate/30 py-2",
						children: [
							enquiry.reference,
							" · ",
							enquiry.full_name,
							" · ",
							enquiry.topic
						]
					}, enquiry.id))] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Risk"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "space-y-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => addVantorisRisk({ data: {
									title: String(form.get("title")),
									detail: String(form.get("detail"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "title",
									placeholder: "Risk title"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "field",
									name: "detail",
									rows: 3,
									placeholder: "What is exposed, and to whom"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 bg-brass px-4 text-navy",
									type: "submit",
									children: "Add risk"
								})
							]
						}),
						office.risks.map((risk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3",
							children: [
								risk.title,
								" · ",
								risk.status
							]
						}, risk.id))
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Audit"
					}), office.history.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						event.action,
						" · ",
						event.detail
					] }, event.id))] })
				]
			}) : null
		]
	});
}
//#endregion
export { Office as component };
