import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as sessionMiddleware } from "./session.middleware-DE4ULBFa.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/security-DCZ7CneE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var securityStatus = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(createSsrRpc("d09caaee34b13cb435ec99aa5d9ad1d2f24a2805870fc4a65cc8d910744d016b"));
var beginSecondFactor = createServerFn({ method: "POST" }).middleware([sessionMiddleware]).handler(createSsrRpc("91874288ed78b79cdf5893277a1b34a8a582fdebc312c7089a02b7f6cc1db57e"));
var confirmSecondFactor = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(createSsrRpc("1898af4237225070350f3d9ec08fe1b4e7bfcaa2b94ffe9d87dc22153309e486"));
var confirmThisSession = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(createSsrRpc("4874e00b5f36de72d9810e6bac559a731c9484a8b282f4210cb48651db31060c"));
var replaceSecondFactor = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(createSsrRpc("96f26154b84fae3be0d08d6e4d666fdece7c952d300fc0fda311273deba55bd3"));
var endOtherSessions = createServerFn({ method: "POST" }).middleware([sessionMiddleware]).handler(createSsrRpc("bf5e5b819d0473460bc7a61e5c8e91624e9752d0fbd1485d832311c9079e2323"));
function Security() {
	const [status, setStatus] = (0, import_react.useState)(null);
	const [secret, setSecret] = (0, import_react.useState)("");
	const [otpauth, setOtpauth] = (0, import_react.useState)("");
	const [codes, setCodes] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)("");
	async function refresh() {
		setStatus(await securityStatus());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => {
			window.location.assign("/login?next=/security");
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-xl px-5 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/access",
				className: "text-sm text-forest",
				children: "Access"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs uppercase tracking-widest text-forest",
				children: "Second factor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl",
				children: "Security"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-ink-muted",
				children: "Email and password only. Google and X are not used. Officer actions also require a code from an authenticator, or a one-time recovery code, on this session. This page is not a certification."
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-amber",
				children: error
			}) : null,
			!status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm",
				children: "Reading this session…"
			}) : null,
			status ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-8 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Factor: ",
						status.status,
						". This session: ",
						status.steppedUp ? "confirmed for 12 hours" : "not confirmed",
						"."
					] }),
					status.status !== "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 bg-forest px-4 text-paper",
						onClick: async () => {
							const result = await beginSecondFactor();
							if ("error" in result && result.error) setError(result.error);
							else if ("secret" in result && result.secret && result.otpauth) {
								setError("");
								setSecret(result.secret);
								setOtpauth(result.otpauth);
							}
						},
						children: "Begin enrolment"
					}) : null,
					secret ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-line p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Enter this key in an authenticator. It is shown once." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 break-all font-mono text-xs",
								children: secret
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 break-all text-xs text-charcoal",
								children: otpauth
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 flex gap-2",
								onSubmit: async (event) => {
									event.preventDefault();
									const form = new FormData(event.currentTarget);
									const result = await confirmSecondFactor({ data: { code: String(form.get("code")) } });
									if ("error" in result && result.error) setError(result.error);
									else if ("recoveryCodes" in result && result.recoveryCodes) {
										setCodes(result.recoveryCodes);
										setSecret("");
										setError("");
										await refresh();
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "field",
									name: "code",
									inputMode: "numeric",
									autoComplete: "one-time-code",
									placeholder: "6-digit code",
									required: true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 border border-line-strong px-3",
									type: "submit",
									children: "Confirm"
								})]
							})
						]
					}) : null,
					codes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-amber p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Recovery codes. Store them now. They will not be shown again. Each works once." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 font-mono text-xs",
							children: codes.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: code }, code))
						})]
					}) : null,
					status.status === "active" && !status.steppedUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-3",
						onSubmit: async (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							const result = await confirmThisSession({ data: {
								code: String(form.get("code") ?? ""),
								recovery: String(form.get("recovery") ?? "")
							} });
							if ("error" in result && result.error) setError(result.error);
							else {
								setError("");
								await refresh();
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Confirm this session"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								name: "code",
								inputMode: "numeric",
								autoComplete: "one-time-code",
								placeholder: "Authenticator code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								name: "recovery",
								placeholder: "Or a recovery code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "min-h-11 bg-forest px-4 text-paper",
								type: "submit",
								children: "Confirm session"
							})
						]
					}) : null,
					status.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-3",
						onSubmit: async (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							const result = await replaceSecondFactor({ data: { recovery: String(form.get("recovery")) } });
							if ("error" in result && result.error) setError(result.error);
							else if ("secret" in result && result.secret && result.otpauth) {
								setSecret(result.secret);
								setOtpauth(result.otpauth);
								setError("The previous factor is retired. Confirm the new key before officer actions will open.");
								await refresh();
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Replace the factor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								name: "recovery",
								placeholder: "Unused recovery code",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "min-h-11 border border-line-strong px-4",
								type: "submit",
								children: "Retire and replace"
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl",
							children: "Sessions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 divide-y divide-line border-y border-line",
							children: status.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "break-all",
									children: [
										session.current ? "This session" : "Other session",
										" · ",
										session.agent || "device not recorded"
									]
								})
							}, session.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-3 min-h-11 border border-line-strong px-4",
							onClick: async () => {
								const result = await endOtherSessions();
								setError("error" in result && result.error ? result.error : "");
								await refresh();
							},
							children: "End every other session"
						})
					] })
				]
			}) : null
		]
	});
}
//#endregion
export { Security as component };
