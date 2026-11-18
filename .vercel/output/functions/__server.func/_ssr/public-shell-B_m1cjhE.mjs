import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, X as require_react, b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Menu, t as X } from "../_libs/lucide-react.mjs";
import { t as UserButton } from "./gates-vdIU0DbP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public-shell-B_m1cjhE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-line bg-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-5 py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6 md:flex-row md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-serif text-lg",
					children: "Ashcombe Private Bank"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-sm text-sm text-charcoal",
					children: "Independent of Vantoris. Enquiries go to operators. Accounts, IBANs and settlement are officer-controlled."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex flex-col gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/ashcombe/enquire",
							className: "text-ink-muted",
							children: "Enquire"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/ashcombe/disclosures",
							className: "text-ink-muted",
							children: "Disclosures"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/ashcombe/registers",
							className: "text-ink-muted",
							children: "Registers"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/security",
							className: "text-ink-muted",
							children: "Security"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/access",
							className: "text-ink-muted",
							children: "Access register"
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 border-t border-line pt-6 text-xs leading-relaxed text-charcoal",
				children: "No banking licence, deposit protection or live interbank connection is claimed. Germany-readiness items stay open until evidence is approved by a second officer."
			})]
		})
	});
}
function Mark({ className = "size-8" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "0.5",
			y: "0.5",
			width: "31",
			height: "31",
			stroke: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M16 6.5 8 24.5h3.1l1.55-3.7h6.7l1.55 3.7H24L16 6.5Zm0 5.2 2.15 5.1h-4.3L16 11.7Z",
			fill: "currentColor"
		})]
	});
}
var NAV = [
	{
		to: "/ashcombe",
		label: "Ashcombe",
		exact: false
	},
	{
		to: "/ashcombe/enquire",
		label: "Enquire",
		exact: true
	},
	{
		to: "/ashcombe/banking",
		label: "Banking",
		exact: false
	},
	{
		to: "/ashcombe/office",
		label: "Office",
		exact: false
	},
	{
		to: "/ashcombe/disclosures",
		label: "Disclosures",
		exact: true
	},
	{
		to: "/vantoris",
		label: "Vantoris",
		exact: false
	},
	{
		to: "/access",
		label: "Access",
		exact: false
	}
];
function active(pathname, to, exact) {
	if (exact) return pathname === to;
	return pathname === to || pathname.startsWith(`${to}/`);
}
function SiteHeader() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "border-b border-line bg-paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3 text-ink",
					"aria-label": "Platform home",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8 shrink-0 text-forest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-serif text-lg leading-tight",
						children: "Ashcombe"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "hidden max-w-[70%] flex-wrap items-center justify-end gap-x-4 gap-y-2 md:flex",
					"aria-label": "Primary",
					children: [NAV.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: link.to,
						className: active(pathname, link.to, link.exact) ? "text-sm font-medium text-ink" : "text-sm text-ink-muted",
						children: link.label
					}, link.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "inline-flex size-11 items-center justify-center md:hidden",
					onClick: () => setOpen((value) => !value),
					"aria-label": open ? "Close menu" : "Open menu",
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 22 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { size: 22 })
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "border-t border-line px-4 py-3 md:hidden",
			children: NAV.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: link.to,
				className: "block min-h-11 py-3 text-sm",
				children: link.label
			}, link.to))
		}) : null]
	});
}
function PublicShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { PublicShell as t };
