import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ashcombeClientHome, g as postMessage, u as createPayment } from "./platform.functions-BcjYjA7s.mjs";
import { t as PublicShell } from "./public-shell-B_m1cjhE.mjs";
import { t as money } from "./money-CbG-wRoi.mjs";
import { E as revokeSession, T as requestCard, c as clientDesk, h as fileComplaint, v as issueStatement } from "./registers.functions-BnTeEUd_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/banking-CSc06sIk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Banking() {
	const [home, setHome] = (0, import_react.useState)(null);
	const [desk, setDesk] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	async function refresh() {
		const next = await ashcombeClientHome();
		setHome(next);
		if (next.allowed) setDesk(await clientDesk());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => {
			window.location.assign("/login?institution=ashcombe&next=/ashcombe/banking");
		});
	}, []);
	async function pay(event) {
		event.preventDefault();
		if (!home || !home.allowed) return;
		const form = new FormData(event.currentTarget);
		const result = await createPayment({ data: {
			accountId: String(form.get("accountId") ?? ""),
			beneficiaryName: String(form.get("beneficiaryName") ?? ""),
			beneficiaryIban: String(form.get("beneficiaryIban") ?? ""),
			referenceText: String(form.get("referenceText") ?? ""),
			amountCents: String(form.get("amountCents") ?? ""),
			idempotencyKey: crypto.randomUUID()
		} });
		if ("error" in result && result.error) setError(result.error);
		else {
			setError("");
			event.currentTarget.reset();
			await refresh();
		}
	}
	async function send(event) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		await postMessage({ data: {
			institution: "ashcombe",
			body: String(form.get("body") ?? "")
		} });
		event.currentTarget.reset();
		await refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-4xl px-5 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-forest",
				children: "Private banking"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Accounts"
			}),
			!home ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: "Opening the ledger…"
			}) : null,
			home && !home.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-sm leading-relaxed",
				children: [
					"This identity has no active Ashcombe client profile. ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/access",
						className: "text-forest",
						children: "Request access"
					}),
					". An account is not created here."
				]
			}) : null,
			home && home.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-2",
						children: [home.accounts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-charcoal",
							children: "No active account. Balances are not invented."
						}) : null, home.accounts.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "border border-line p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs uppercase tracking-widest text-charcoal",
									children: account.currency
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-2 font-serif text-2xl",
									children: account.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 font-serif text-3xl",
									children: money(account.balance_cents, account.currency)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-charcoal",
									children: account.iban_status === "issued" && account.iban ? `IBAN ${account.iban}` : "IBAN not issued"
								})
							]
						}, account.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Posted activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 divide-y divide-line border-y border-line",
						children: [home.activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "py-3 text-sm text-charcoal",
							children: "No posted entries."
						}) : null, home.activity.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between py-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: entry.narrative }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [entry.direction === "credit" ? "+" : "−", money(entry.amount_cents, entry.currency)] })]
						}, entry.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: pay,
						className: "space-y-3 border border-line p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Payment instruction"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-charcoal",
								children: "Submitting does not settle. Officers must validate, authorise, evidence and reconcile. An approved single-instruction limit, if one exists, is enforced. None is invented."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "field",
								name: "accountId",
								required: true,
								children: home.accounts.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: account.id,
									children: [
										account.name,
										" · ",
										account.currency
									]
								}, account.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								name: "beneficiaryName",
								placeholder: "Beneficiary name",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								name: "beneficiaryIban",
								placeholder: "Beneficiary IBAN",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								name: "amountCents",
								inputMode: "numeric",
								placeholder: "Amount in cents",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								name: "referenceText",
								placeholder: "Reference",
								required: true
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-amber",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "min-h-11 bg-forest px-5 text-sm text-paper",
								type: "submit",
								disabled: home.accounts.length === 0,
								children: "Submit instruction"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: send,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Secure note"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2 text-sm",
								children: home.thread.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: message.body }, message.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "field",
								name: "body",
								rows: 3,
								placeholder: "Message your relationship team",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "min-h-11 border border-line-strong px-5 text-sm",
								type: "submit",
								children: "Send"
							})
						]
					}),
					desk && desk.allowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Statements"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-charcoal",
								children: "Issued from posted entries only. Opening is the previous closing, or zero."
							}),
							desk.statements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm",
								children: "None issued."
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 text-sm",
								children: desk.statements.map((statement) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "border-b border-line py-2",
									children: [
										statement.period_label,
										" · open ",
										money(Number(statement.opening_cents), statement.currency),
										" · close ",
										money(Number(statement.closing_cents), statement.currency),
										" · ",
										Number(statement.line_count),
										" lines"
									]
								}, statement.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 grid gap-3 md:grid-cols-3",
								onSubmit: async (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									const result = await issueStatement({ data: {
										accountId: String(form.get("accountId")),
										periodLabel: String(form.get("periodLabel"))
									} });
									setNote("error" in result && result.error ? result.error : "Statement issued from the posted ledger.");
									await refresh();
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "field",
										name: "accountId",
										required: true,
										children: home.accounts.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: account.id,
											children: account.name
										}, account.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										name: "periodLabel",
										placeholder: "Period, for example 2026-11",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-line-strong text-sm",
										type: "submit",
										disabled: home.accounts.length === 0,
										children: "Issue statement"
									})
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Card request"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-charcoal",
								children: "This asks the bank to consider a card. It does not create a number or contact a scheme."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 grid gap-3 md:grid-cols-3",
								onSubmit: async (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									const result = await requestCard({ data: {
										accountId: String(form.get("accountId")),
										label: String(form.get("label"))
									} });
									setNote("error" in result && result.error ? result.error : "Request recorded. It is not a live card.");
									event.currentTarget.reset();
									await refresh();
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "field",
										name: "accountId",
										required: true,
										children: home.accounts.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: account.id,
											children: account.name
										}, account.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										name: "label",
										placeholder: "Label, for example Travel",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-line-strong text-sm",
										type: "submit",
										disabled: home.accounts.length === 0,
										children: "Request"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 text-sm",
								children: desk.cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "border-b border-line py-2",
									children: [
										card.label,
										" · ",
										card.status
									]
								}, card.id))
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Documents"
							}),
							desk.documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-charcoal",
								children: "None filed for you."
							}) : null,
							desk.documents.map((document) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "mt-3 border border-line p-4 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-medium",
										children: document.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-charcoal",
										children: document.kind
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 whitespace-pre-wrap",
										children: document.body
									})
								]
							}, document.id))
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Complaint"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 space-y-3",
								onSubmit: async (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									const result = await fileComplaint({ data: {
										institution: "ashcombe",
										subject: String(form.get("subject")),
										detail: String(form.get("detail"))
									} });
									setNote("reference" in result && result.reference ? `Recorded ${result.reference}. It does not move money.` : result.error ?? "");
									if ("reference" in result && result.reference) event.currentTarget.reset();
									await refresh();
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										name: "subject",
										placeholder: "Subject",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "field",
										name: "detail",
										rows: 3,
										placeholder: "What should be looked at",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "min-h-11 border border-line-strong px-5 text-sm",
										type: "submit",
										children: "File complaint"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 text-sm",
								children: desk.complaints.map((complaint) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									complaint.reference,
									" · ",
									complaint.subject,
									" · ",
									complaint.status
								] }, complaint.id))
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Sessions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-charcoal",
								children: "You can end one of your own sessions. A second factor is not offered by this sign-in."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 text-sm",
								children: desk.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex flex-wrap items-center justify-between gap-2 border-b border-line py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "break-all",
										children: [
											session.agent || "Session",
											" · ",
											session.ip || "address not recorded"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-forest",
										onClick: async () => {
											const result = await revokeSession({ data: { sessionId: session.id } });
											setNote(result.error ?? "Session ended.");
											await refresh();
										},
										children: "End"
									})]
								}, session.id))
							})
						] }),
						note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-amber",
							children: note
						}) : null
					] }) : null
				]
			}) : null
		]
	}) });
}
//#endregion
export { Banking as component };
