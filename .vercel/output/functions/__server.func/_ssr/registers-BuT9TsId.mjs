import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as publishWork, D as vantorisRegisters, _ as fileVantorisObligation, b as proposeDelegation, d as confirmDelegation, g as fileDocument, i as appointOfficer, l as closeComplaint, m as draftPublication, n as addRisk, o as approveVantorisObligation, p as draftPolicy, r as adoptPolicy, t as addDepartment, u as closeIncident, w as reportIncident } from "./registers.functions-BnTeEUd_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/registers-BuT9TsId.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Registers() {
	const [desk, setDesk] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	async function refresh() {
		setDesk(await vantorisRegisters());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => {
			window.location.assign("/login?institution=vantoris&next=/vantoris/registers");
		});
	}, []);
	async function run(action) {
		const result = await action();
		setError(result.error ?? "");
		await refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-navy px-5 py-12 text-ivory",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/vantoris/office",
					className: "text-sm text-brass",
					children: "Office"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-4xl",
					children: "Institutional registers"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-slate",
					children: "Vantoris only. No accounts, IBANs, cards or Ashcombe ledger. Germany obligations are not on this desk."
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-brass",
					children: error
				}) : null,
				!desk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm",
					children: "Opening the registers…"
				}) : null,
				desk && !desk.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm",
					children: desk.stepUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						desk.stepUp,
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
				desk && desk.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 space-y-10 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-slate",
							children: [
								"Role ",
								desk.role,
								". Active officers recorded: ",
								desk.staffCount,
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Appoint"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 grid gap-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => appointOfficer({ data: {
									institution: "vantoris",
									userId: String(form.get("userId")),
									displayName: String(form.get("displayName")),
									role: String(form.get("role"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field text-ivory",
									name: "userId",
									placeholder: "Sign-in user id",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field text-ivory",
									name: "displayName",
									placeholder: "Name",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "field text-ivory",
									name: "role",
									defaultValue: "operations",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "operations",
											children: "Operations"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "compliance",
											children: "Compliance"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "audit",
											children: "Audit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "relationship",
											children: "Relationship"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 bg-brass text-navy",
									type: "submit",
									children: "Appoint"
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Institutional obligations"
						}), desk.obligations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "mt-4 border-t border-brass/40 pt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									item.code,
									" · ",
									item.title
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-slate",
									children: item.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1",
									children: [
										item.status,
										" · ",
										item.approval_status
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "mt-2 flex gap-2",
									onSubmit: (event) => {
										event.preventDefault();
										const form = new FormData(event.currentTarget);
										run(() => fileVantorisObligation({ data: {
											code: item.code,
											evidence: String(form.get("evidence"))
										} }));
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "evidence",
										placeholder: "Evidence reference"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-brass px-3 text-brass",
										type: "submit",
										children: "File"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mt-2 text-brass",
									onClick: () => run(() => approveVantorisObligation({ data: { code: item.code } })),
									children: "Approve"
								})
							]
						}, item.code))] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Documents"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 grid gap-3",
								onSubmit: (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									run(() => fileDocument({ data: {
										institution: "vantoris",
										ownerUserId: String(form.get("ownerUserId")),
										title: String(form.get("title")),
										kind: String(form.get("kind")),
										classification: String(form.get("classification")),
										body: String(form.get("body"))
									} }));
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "ownerUserId",
										placeholder: "Member user id",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "title",
										placeholder: "Title",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "kind",
										placeholder: "Kind",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "field text-ivory",
										name: "classification",
										defaultValue: "internal",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "internal",
											children: "Internal"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "client",
											children: "Visible to that member"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field text-ivory",
										name: "body",
										rows: 3,
										placeholder: "Record text. Not scanned.",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 bg-brass text-navy",
										type: "submit",
										children: "File"
									})
								]
							}),
							desk.documents.map((document) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2",
								children: [
									document.title,
									" · ",
									document.classification
								]
							}, document.id))
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Complaints, risk, incidents"
							}),
							desk.complaints.map((complaint) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									complaint.reference,
									" · ",
									complaint.subject,
									" · ",
									complaint.status
								] }), complaint.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-brass",
									onClick: () => run(() => closeComplaint({ data: { complaintId: complaint.id } })),
									children: "Close"
								}) : null]
							}, complaint.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 grid gap-3",
								onSubmit: (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									run(() => addRisk({ data: {
										institution: "vantoris",
										title: String(form.get("title")),
										detail: String(form.get("detail"))
									} }));
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "title",
										placeholder: "Risk",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field text-ivory",
										name: "detail",
										rows: 2,
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-brass text-brass",
										type: "submit",
										children: "Add risk"
									})
								]
							}),
							desk.risks.map((risk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2",
								children: [
									risk.title,
									" · ",
									risk.status
								]
							}, risk.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 grid gap-3",
								onSubmit: (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									run(() => reportIncident({ data: {
										institution: "vantoris",
										title: String(form.get("title")),
										detail: String(form.get("detail")),
										severity: String(form.get("severity"))
									} }));
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "title",
										placeholder: "Incident",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "field text-ivory",
										name: "severity",
										defaultValue: "low",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "low",
											children: "Low"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "high",
											children: "High"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field text-ivory",
										name: "detail",
										rows: 2,
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-brass text-brass",
										type: "submit",
										children: "Report"
									})
								]
							}),
							desk.incidents.map((incident) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									incident.title,
									" · ",
									incident.status
								] }), incident.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-brass",
									onClick: () => run(() => closeIncident({ data: { incidentId: incident.id } })),
									children: "Close"
								}) : null]
							}, incident.id))
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: "Policy, research, departments"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 grid gap-3",
								onSubmit: (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									run(() => draftPolicy({ data: {
										institution: "vantoris",
										title: String(form.get("title")),
										body: String(form.get("body"))
									} }));
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "title",
										placeholder: "Policy",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field text-ivory",
										name: "body",
										rows: 2,
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-brass text-brass",
										type: "submit",
										children: "Draft policy"
									})
								]
							}),
							desk.policies.map((policy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									policy.title,
									" · ",
									policy.status
								] }), policy.status === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-brass",
									onClick: () => run(() => adoptPolicy({ data: { policyId: policy.id } })),
									children: "Adopt"
								}) : null]
							}, policy.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 grid gap-3",
								onSubmit: (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									run(() => draftPublication({ data: {
										institution: "vantoris",
										title: String(form.get("title")),
										summary: String(form.get("summary"))
									} }));
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "title",
										placeholder: "Research title",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field text-ivory",
										name: "summary",
										rows: 2,
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-brass text-brass",
										type: "submit",
										children: "Draft publication"
									})
								]
							}),
							desk.publications.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									item.title,
									" · ",
									item.status
								] }), item.status === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-brass",
									onClick: () => run(() => publishWork({ data: { publicationId: item.id } })),
									children: "Release"
								}) : null]
							}, item.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 grid gap-3",
								onSubmit: (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									run(() => addDepartment({ data: {
										institution: "vantoris",
										name: String(form.get("name")),
										purpose: String(form.get("purpose"))
									} }));
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "name",
										placeholder: "Department",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "purpose",
										placeholder: "Purpose",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-brass text-brass",
										type: "submit",
										children: "Add department"
									})
								]
							}),
							desk.departments.map((department) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2",
								children: [
									department.name,
									" — ",
									department.purpose
								]
							}, department.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 grid gap-3",
								onSubmit: (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									run(() => proposeDelegation({ data: {
										institution: "vantoris",
										toUserId: String(form.get("toUserId")),
										scope: String(form.get("scope"))
									} }));
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field text-ivory",
										name: "toUserId",
										placeholder: "Delegate user id",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field text-ivory",
										name: "scope",
										rows: 2,
										placeholder: "Scope. Confirmation does not copy a role.",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-brass text-brass",
										type: "submit",
										children: "Propose delegation"
									})
								]
							}),
							desk.delegations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"To ",
									item.to_user_id,
									" · ",
									item.status
								] }), item.status === "proposed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-brass",
									onClick: () => run(() => confirmDelegation({ data: { delegationId: item.id } })),
									children: "Confirm"
								}) : null]
							}, item.id))
						] })
					]
				}) : null
			]
		})
	});
}
//#endregion
export { Registers as component };
