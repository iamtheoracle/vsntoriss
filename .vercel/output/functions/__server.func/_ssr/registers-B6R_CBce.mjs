import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PublicShell } from "./public-shell-B_m1cjhE.mjs";
import { t as money } from "./money-CbG-wRoi.mjs";
import { C as publishWork, a as approveLimit, b as proposeDelegation, d as confirmDelegation, f as decideCard, g as fileDocument, i as appointOfficer, l as closeComplaint, m as draftPublication, n as addRisk, p as draftPolicy, r as adoptPolicy, s as ashcombeRegisters, t as addDepartment, u as closeIncident, w as reportIncident, x as proposeLimit } from "./registers.functions-BnTeEUd_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/registers-B6R_CBce.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Registers() {
	const [desk, setDesk] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	async function refresh() {
		setDesk(await ashcombeRegisters());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => {
			window.location.assign("/login?institution=ashcombe&next=/ashcombe/registers");
		});
	}, []);
	async function run(action) {
		const result = await action();
		setError(result.error ?? "");
		await refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-5xl px-5 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-forest",
				children: "Ashcombe registers"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Governance desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 max-w-2xl text-sm text-charcoal",
				children: [
					"Germany readiness stays on the ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/ashcombe/office",
						className: "text-forest",
						children: "operations desk"
					}),
					". Nothing here issues a card to a scheme, moves the ledger, or copies Vantoris authority."
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-amber",
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
						className: "text-forest",
						children: "Security"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["No Ashcombe staff profile. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/access",
					className: "text-forest",
					children: "Access register"
				})] })
			}) : null,
			desk && desk.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"Signed in as ",
							desk.role,
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Position"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 grid gap-3 text-sm md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border border-line p-4",
								children: [
									"Open Germany items",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									Number(desk.counts?.open_obligations ?? 0),
									" · verified ",
									Number(desk.counts?.verified_obligations ?? 0)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border border-line p-4",
								children: [
									"Open instructions",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									Number(desk.counts?.payments_open ?? 0)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border border-line p-4",
								children: [
									"Posted client funds",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									money(Number(desk.counts?.client_funds_cents ?? 0), "EUR"),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-xs text-charcoal",
										children: "Sum of the ledger. Not a house balance, and not converted."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border border-line p-4",
								children: [
									"Open complaints",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									Number(desk.counts?.open_complaints ?? 0)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border border-line p-4",
								children: [
									"Open incidents",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									Number(desk.counts?.open_incidents ?? 0)
								]
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Appoint an officer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-charcoal",
							children: "Executive only. You cannot appoint yourself, and you cannot create another executive from here."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 grid gap-3 md:grid-cols-2",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => appointOfficer({ data: {
									institution: "ashcombe",
									userId: String(form.get("userId")),
									displayName: String(form.get("displayName")),
									role: String(form.get("role"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "userId",
									placeholder: "Sign-in user id",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "displayName",
									placeholder: "Name on the register",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "field",
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
									className: "min-h-11 bg-forest text-sm text-paper",
									type: "submit",
									children: "Appoint"
								})
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Single-instruction limits"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-charcoal",
							children: "Until a limit is approved, none is invented. Client instructions above an active limit are refused."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 grid gap-3 md:grid-cols-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => proposeLimit({ data: {
									currency: String(form.get("currency")),
									maxCents: String(form.get("maxCents"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "field",
									name: "currency",
									defaultValue: "EUR",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "EUR" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "GBP" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "USD" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "maxCents",
									placeholder: "Ceiling in cents",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 border border-line-strong text-sm",
									type: "submit",
									children: "Propose"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 text-sm",
							children: desk.limits.map((limit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-center justify-between gap-2 border-b border-line py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									limit.currency,
									" · ",
									money(Number(limit.max_cents), limit.currency),
									" · ",
									limit.status
								] }), limit.status === "proposed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-forest",
									onClick: () => run(() => approveLimit({ data: { limitId: limit.id } })),
									children: "Approve"
								}) : null]
							}, limit.id))
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Card requests"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-charcoal",
							children: "Approval is internal. No PAN is stored and no scheme is contacted."
						}),
						desk.cards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm",
							children: "None."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 text-sm",
							children: desk.cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap justify-between gap-2 border-b border-line py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									card.label,
									" · ",
									card.status
								] }), card.status === "requested" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-forest",
										onClick: () => run(() => decideCard({ data: {
											cardId: card.id,
											decision: "approved_internal"
										} })),
										children: "Approve internally"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => run(() => decideCard({ data: {
											cardId: card.id,
											decision: "declined"
										} })),
										children: "Decline"
									})]
								}) : null]
							}, card.id))
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Documents"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 grid gap-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => fileDocument({ data: {
									institution: "ashcombe",
									ownerUserId: String(form.get("ownerUserId")),
									title: String(form.get("title")),
									kind: String(form.get("kind")),
									classification: String(form.get("classification")),
									body: String(form.get("body"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "ownerUserId",
									placeholder: "Owner user id, or institution",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "title",
									placeholder: "Title",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "kind",
									placeholder: "Kind, for example correspondence",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "field",
									name: "classification",
									defaultValue: "internal",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "internal",
										children: "Internal"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "client",
										children: "Visible to that client"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "field",
									name: "body",
									rows: 4,
									placeholder: "Text of the record, or a storage reference. Files are not scanned here.",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 bg-forest text-sm text-paper",
									type: "submit",
									children: "File record"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 text-sm",
							children: desk.documents.map((document) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border-b border-line py-2",
								children: [
									document.title,
									" · ",
									document.classification,
									" · ",
									document.kind
								]
							}, document.id))
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Complaints"
						}),
						desk.complaints.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm",
							children: "None filed."
						}) : null,
						desk.complaints.map((complaint) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex flex-wrap justify-between gap-2 border-b border-line py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								complaint.reference,
								" · ",
								complaint.subject,
								" · ",
								complaint.status
							] }), complaint.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-forest",
								onClick: () => run(() => closeComplaint({ data: { complaintId: complaint.id } })),
								children: "Close"
							}) : null]
						}, complaint.id))
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Risk and incidents"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 grid gap-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => addRisk({ data: {
									institution: "ashcombe",
									title: String(form.get("title")),
									detail: String(form.get("detail"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "title",
									placeholder: "Risk",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "field",
									name: "detail",
									rows: 3,
									placeholder: "Exposure",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 border border-line-strong text-sm",
									type: "submit",
									children: "Add risk"
								})
							]
						}),
						desk.risks.map((risk) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm",
							children: [
								risk.title,
								" · ",
								risk.status
							]
						}, risk.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-6 grid gap-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => reportIncident({ data: {
									institution: "ashcombe",
									title: String(form.get("title")),
									detail: String(form.get("detail")),
									severity: String(form.get("severity"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "title",
									placeholder: "Incident",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "field",
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
									className: "field",
									name: "detail",
									rows: 3,
									placeholder: "What happened",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 border border-line-strong text-sm",
									type: "submit",
									children: "Report incident"
								})
							]
						}),
						desk.incidents.map((incident) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								incident.title,
								" · ",
								incident.severity,
								" · ",
								incident.status
							] }), incident.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-forest",
								onClick: () => run(() => closeIncident({ data: { incidentId: incident.id } })),
								children: "Close"
							}) : null]
						}, incident.id))
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Policy and publication"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 grid gap-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => draftPolicy({ data: {
									institution: "ashcombe",
									title: String(form.get("title")),
									body: String(form.get("body"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "title",
									placeholder: "Policy title",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "field",
									name: "body",
									rows: 3,
									placeholder: "Policy text",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 border border-line-strong text-sm",
									type: "submit",
									children: "Draft policy"
								})
							]
						}),
						desk.policies.map((policy) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								policy.title,
								" · ",
								policy.status
							] }), policy.status === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-forest",
								onClick: () => run(() => adoptPolicy({ data: { policyId: policy.id } })),
								children: "Adopt"
							}) : null]
						}, policy.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-6 grid gap-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => draftPublication({ data: {
									institution: "ashcombe",
									title: String(form.get("title")),
									summary: String(form.get("summary"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "title",
									placeholder: "Publication title",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "field",
									name: "summary",
									rows: 3,
									placeholder: "Summary that may be released",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 border border-line-strong text-sm",
									type: "submit",
									children: "Draft publication"
								})
							]
						}),
						desk.publications.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								item.title,
								" · ",
								item.status
							] }), item.status === "draft" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-forest",
								onClick: () => run(() => publishWork({ data: { publicationId: item.id } })),
								children: "Release"
							}) : null]
						}, item.id))
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Departments and delegation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 grid gap-3 md:grid-cols-2",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => addDepartment({ data: {
									institution: "ashcombe",
									name: String(form.get("name")),
									purpose: String(form.get("purpose"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "name",
									placeholder: "Department",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "purpose",
									placeholder: "Purpose",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 border border-line-strong text-sm md:col-span-2",
									type: "submit",
									children: "Add department"
								})
							]
						}),
						desk.departments.map((department) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm",
							children: [
								department.name,
								" — ",
								department.purpose
							]
						}, department.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-6 grid gap-3",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => proposeDelegation({ data: {
									institution: "ashcombe",
									toUserId: String(form.get("toUserId")),
									scope: String(form.get("scope"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "toUserId",
									placeholder: "Delegate user id",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "field",
									name: "scope",
									rows: 2,
									placeholder: "What the note covers. Confirming it does not copy your role.",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 border border-line-strong text-sm",
									type: "submit",
									children: "Propose delegation"
								})
							]
						}),
						desk.delegations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 flex justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"To ",
								item.to_user_id,
								" · ",
								item.status
							] }), item.status === "proposed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-forest",
								onClick: () => run(() => confirmDelegation({ data: { delegationId: item.id } })),
								children: "Confirm record"
							}) : null]
						}, item.id))
					] })
				]
			}) : null
		]
	}) });
}
//#endregion
export { Registers as component };
