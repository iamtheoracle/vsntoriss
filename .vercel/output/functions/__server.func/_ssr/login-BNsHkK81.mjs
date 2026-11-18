import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$16 } from "./router-CkdlM3Cw.mjs";
import { t as authClient } from "./client-BhcLuWvF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BNsHkK81.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HOME = {
	ashcombe: "/ashcombe/banking",
	vantoris: "/vantoris/portal"
};
function institutionOf(path) {
	const clean = path.split("?")[0]?.split("#")[0] ?? "";
	if (clean === "/ashcombe" || clean.startsWith("/ashcombe/")) return "ashcombe";
	if (clean === "/vantoris" || clean.startsWith("/vantoris/")) return "vantoris";
	return null;
}
/** Keep a post-login path inside the institution that opened the sign-in. */
function stayOnInstitution(institution, next) {
	if (!isLocalPath(next)) return HOME[institution];
	const path = next.split("?")[0] ?? "";
	if (institutionOf(path) === institution) return next;
	if (path === "/security") return "/security";
	return HOME[institution];
}
function isLocalPath(next) {
	return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\");
}
function Login() {
	const search = Route$16.useSearch();
	const institution = search.institution ?? institutionOf(search.next) ?? void 0;
	if (!institution) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstitutionDoors, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstitutionLogin, {
		institution,
		next: search.next
	});
}
function InstitutionDoors() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-widest text-charcoal",
				children: "Choose an institution"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-serif text-4xl text-ink",
				children: "Sign in where you belong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm leading-relaxed text-ink-muted",
				children: "There is no shared Google or X sign-in. An Ashcombe sign-in stays on Ashcombe. A Vantoris sign-in stays on Vantoris."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/login",
					search: {
						institution: "ashcombe",
						next: "/ashcombe/banking"
					},
					className: "border border-line bg-paper-warm p-6 hover:border-forest",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-widest text-forest",
						children: "Ashcombe Private Bank"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-serif text-2xl",
						children: "Sign in to Ashcombe"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/login",
					search: {
						institution: "vantoris",
						next: "/vantoris/portal"
					},
					className: "bg-navy p-6 text-ivory hover:bg-navy-deep",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-widest text-brass",
						children: "Vantoris Private Institution"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-3xl",
						children: "Sign in to Vantoris"
					})]
				})]
			})
		]
	});
}
function InstitutionLogin({ institution, next }) {
	const destination = stayOnInstitution(institution, next);
	const ashcombe = institution === "ashcombe";
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	async function onEmail(event) {
		event.preventDefault();
		setError("");
		const result = mode === "up" ? await authClient.signUp.email({
			email,
			password,
			name,
			callbackURL: destination
		}) : await authClient.signIn.email({
			email,
			password,
			callbackURL: destination
		});
		if (result.error) {
			setError(result.error.message ?? "Sign-in failed.");
			return;
		}
		window.location.assign(destination);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: ashcombe ? "mx-auto flex min-h-screen max-w-md flex-col justify-center bg-paper px-5 py-16 text-ink" : "mx-auto flex min-h-screen max-w-md flex-col justify-center bg-navy px-5 py-16 text-ivory",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: ashcombe ? "/ashcombe" : "/vantoris",
				className: ashcombe ? "text-sm text-forest" : "text-sm text-brass",
				children: ashcombe ? "Ashcombe" : "Vantoris"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: ashcombe ? "mt-6 text-xs uppercase tracking-widest text-forest" : "mt-6 text-xs uppercase tracking-widest text-brass",
				children: ashcombe ? "Ashcombe Private Bank" : "Vantoris Private Institution"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: ashcombe ? "mt-3 font-serif text-4xl" : "mt-3 font-display text-5xl",
				children: "Sign in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: ashcombe ? "mt-3 text-sm leading-relaxed text-ink-muted" : "mt-3 text-sm leading-relaxed text-slate",
				children: [
					"Email and password only. This sign-in returns to ",
					ashcombe ? "Ashcombe" : "Vantoris",
					" and does not open the other institution."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onEmail,
				className: "mt-8 space-y-3",
				children: [
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						placeholder: "Name",
						value: name,
						onChange: (event) => setName(event.target.value),
						required: true
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: "email",
						placeholder: "Email",
						value: email,
						onChange: (event) => setEmail(event.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: "password",
						minLength: 12,
						placeholder: "Password, 12 characters",
						value: password,
						onChange: (event) => setPassword(event.target.value),
						required: true
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-amber",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: ashcombe ? "min-h-11 w-full bg-forest px-4 text-sm text-paper" : "min-h-11 w-full bg-brass px-4 text-sm text-navy",
						children: mode === "up" ? "Create email sign-in" : "Sign in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: ashcombe ? "text-sm text-ink-muted" : "text-sm text-slate",
						onClick: () => setMode(mode === "up" ? "in" : "up"),
						children: mode === "up" ? "I already have a sign-in" : "Create an email sign-in"
					})
				]
			})
		]
	});
}
//#endregion
export { Login as component };
