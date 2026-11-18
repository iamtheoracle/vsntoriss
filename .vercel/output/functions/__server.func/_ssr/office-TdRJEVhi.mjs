import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as proposeAccount, b as recordBranchReceipt, c as checkBranchReceipt, f as decideProfile, h as issueKycLink, i as approveObligation, l as confirmIban, n as advancePayment, o as ashcombeOffice, p as fileObligation, r as approveAccount, v as proposeIban } from "./platform.functions-BcjYjA7s.mjs";
import { t as PublicShell } from "./public-shell-B_m1cjhE.mjs";
import { t as money } from "./money-CbG-wRoi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/office-TdRJEVhi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Office() {
	const [office, setOffice] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [link, setLink] = (0, import_react.useState)("");
	async function refresh() {
		setOffice(await ashcombeOffice());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => {
			window.location.assign("/login?institution=ashcombe&next=/ashcombe/office");
		});
	}, []);
	async function run(action) {
		setError("");
		const result = await action();
		if (result.error) setError(result.error);
		if (result.token) setLink(`${window.location.origin}/kyc/${result.token}`);
		await refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-5xl px-5 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-forest",
				children: "Ashcombe office"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Operations"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-amber",
				children: error
			}) : null,
			link ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 break-all text-sm",
				children: ["KYC link, send privately: ", link]
			}) : null,
			!office ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: "Opening the office…"
			}) : null,
			office && !office.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: office.stepUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					office.stepUp,
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
			office && office.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-charcoal",
						children: [
							"Signed in as ",
							office.role,
							". The server refuses actions outside that role, including your own approvals. Governance registers live on the ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/ashcombe/registers",
								className: "text-forest",
								children: "registers desk"
							}),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Enquiries"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-line border-y border-line",
						children: office.enquiries.map((enquiry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [
										enquiry.reference,
										" · ",
										enquiry.full_name,
										" · ",
										enquiry.topic
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-charcoal",
									children: enquiry.message
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mt-2 text-forest",
									onClick: () => run(() => issueKycLink({ data: { enquiryId: enquiry.id } })),
									children: "Issue KYC link"
								})
							]
						}, enquiry.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Profiles"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 divide-y divide-line border-y border-line text-sm",
							children: office.people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-center justify-between gap-2 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									person.display_name,
									" · ",
									person.kind,
									" · ",
									person.role,
									" · ",
									person.status
								] }), person.status === "pending" && person.user_id !== office.self ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-forest",
									onClick: () => run(() => decideProfile({ data: {
										profileId: person.id,
										decision: "active"
									} })),
									children: "Activate"
								}) : null]
							}, person.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 grid gap-3 md:grid-cols-4",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => proposeAccount({ data: {
									clientUserId: String(form.get("clientUserId")),
									name: String(form.get("name")),
									currency: String(form.get("currency"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "clientUserId",
									placeholder: "Client user id"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "name",
									placeholder: "Account name"
								}),
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 bg-forest text-sm text-paper",
									type: "submit",
									children: "Propose account"
								})
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Accounts, IBAN, branch"
						}),
						office.accounts.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "mt-4 border border-line p-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									account.name,
									" · ",
									account.currency,
									" · ",
									account.status,
									" · ",
									money(account.balance_cents, account.currency)
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-charcoal",
									children: [
										"Client ",
										account.client_user_id,
										" · IBAN ",
										account.iban_status,
										" ",
										account.iban ?? ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-3",
									children: [account.status === "proposed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-forest",
										onClick: () => run(() => approveAccount({ data: { accountId: account.id } })),
										children: "Approve opening"
									}) : null, account.iban_status === "proposed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-forest",
										onClick: () => run(() => confirmIban({ data: { accountId: account.id } })),
										children: "Confirm IBAN"
									}) : null]
								}),
								account.status === "active" && account.iban_status === "not_issued" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "mt-3 flex gap-2",
									onSubmit: (event) => {
										event.preventDefault();
										const form = new FormData(event.currentTarget);
										run(() => proposeIban({ data: {
											accountId: account.id,
											iban: String(form.get("iban"))
										} }));
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										name: "iban",
										placeholder: "IBAN to assign"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-line-strong px-3 text-sm",
										type: "submit",
										children: "Propose"
									})]
								}) : null
							]
						}, account.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 grid gap-3 md:grid-cols-2",
							onSubmit: (event) => {
								event.preventDefault();
								const form = new FormData(event.currentTarget);
								run(() => recordBranchReceipt({ data: {
									accountId: String(form.get("accountId")),
									amountCents: String(form.get("amountCents")),
									branchName: String(form.get("branchName")),
									method: String(form.get("method")),
									narrative: String(form.get("narrative"))
								} }));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "accountId",
									placeholder: "Account id"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "amountCents",
									placeholder: "Cents received"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "branchName",
									placeholder: "Branch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "method",
									placeholder: "Cash or cheque"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field md:col-span-2",
									name: "narrative",
									placeholder: "Narrative"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 bg-forest text-sm text-paper md:col-span-2",
									type: "submit",
									children: "Record branch receipt"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 text-sm",
							children: office.receipts.map((receipt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between border-b border-line py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									receipt.branch_name,
									" · ",
									receipt.method,
									" · ",
									money(receipt.amount_cents, receipt.currency),
									" · ",
									receipt.status
								] }), receipt.status === "recorded" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-forest",
									onClick: () => run(() => checkBranchReceipt({ data: { receiptId: receipt.id } })),
									children: "Check and post"
								}) : null]
							}, receipt.id))
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Payments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-3 text-sm",
						children: office.payments.map((payment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border border-line p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									payment.beneficiary_name,
									" · ",
									money(payment.amount_cents, payment.currency),
									" · ",
									payment.status
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-charcoal",
									children: payment.reference_text
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => run(() => advancePayment({ data: {
												paymentId: payment.id,
												step: "validate"
											} })),
											children: "Validate"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => run(() => advancePayment({ data: {
												paymentId: payment.id,
												step: "authorise"
											} })),
											children: "Authorise"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => run(() => advancePayment({ data: {
												paymentId: payment.id,
												step: "process"
											} })),
											children: "Process"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => run(() => advancePayment({ data: {
												paymentId: payment.id,
												step: "reject"
											} })),
											children: "Reject"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => run(() => advancePayment({ data: {
												paymentId: payment.id,
												step: "exception"
											} })),
											children: "Park as exception"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => run(() => advancePayment({ data: {
												paymentId: payment.id,
												step: "reopen"
											} })),
											children: "Reopen"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "mt-2 flex gap-2",
									onSubmit: (event) => {
										event.preventDefault();
										const form = new FormData(event.currentTarget);
										run(() => advancePayment({ data: {
											paymentId: payment.id,
											step: "settlement",
											settlementReference: String(form.get("settlementReference"))
										} }));
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										name: "settlementReference",
										placeholder: "Settlement evidence reference"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-line-strong px-3",
										type: "submit",
										children: "Record evidence"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mt-2 text-forest",
									onClick: () => run(() => advancePayment({ data: {
										paymentId: payment.id,
										step: "reconcile"
									} })),
									children: "Reconcile and post debit"
								})
							]
						}, payment.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Germany readiness"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-4",
						children: office.obligations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border border-line p-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [
										item.code,
										" · ",
										item.title
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-charcoal",
									children: item.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1",
									children: [
										item.status,
										" · ",
										item.approval_status,
										" ",
										item.evidence_reference ? `· ${item.evidence_reference}` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "mt-2 flex gap-2",
									onSubmit: (event) => {
										event.preventDefault();
										const form = new FormData(event.currentTarget);
										run(() => fileObligation({ data: {
											code: item.code,
											evidence: String(form.get("evidence")),
											nextReview: String(form.get("nextReview") ?? "")
										} }));
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field",
											name: "evidence",
											placeholder: "Evidence reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "field",
											name: "nextReview",
											placeholder: "YYYY-MM-DD"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "min-h-11 border border-line-strong px-3",
											type: "submit",
											children: "File"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mt-2 text-forest",
									onClick: () => run(() => approveObligation({ data: { code: item.code } })),
									children: "Approve verification"
								})
							]
						}, item.code))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Audit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 text-sm",
						children: office.history.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border-b border-line py-2",
							children: [
								event.action,
								" · ",
								event.entity,
								" · ",
								event.detail
							]
						}, event.id))
					})] })
				]
			}) : null
		]
	}) });
}
//#endregion
export { Office as component };
