import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DGfkxNi8.mjs";
import { t as sessionMiddleware } from "./session.middleware-DE4ULBFa.mjs";
import { a as presentRecovery, c as revokeOtherSessions, i as presentFactor, l as securityView, n as confirmEnrolment, r as createServerRpc, s as replaceWithRecovery, t as beginEnrolment } from "./mfa.store-DGQAIV_c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mfa.functions-C8_YA3Q1.js
async function emailOf(userId) {
	return (await (await getSql())`select "email" from "user" where "id" = ${userId}`)[0]?.email ?? "";
}
var securityStatus_createServerFn_handler = createServerRpc({
	id: "d09caaee34b13cb435ec99aa5d9ad1d2f24a2805870fc4a65cc8d910744d016b",
	name: "securityStatus",
	filename: "src/lib/mfa.functions.ts"
}, (opts) => securityStatus.__executeServer(opts));
var securityStatus = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(securityStatus_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	return securityView(sql, context.userId, context.sessionId);
});
var beginSecondFactor_createServerFn_handler = createServerRpc({
	id: "91874288ed78b79cdf5893277a1b34a8a582fdebc312c7089a02b7f6cc1db57e",
	name: "beginSecondFactor",
	filename: "src/lib/mfa.functions.ts"
}, (opts) => beginSecondFactor.__executeServer(opts));
var beginSecondFactor = createServerFn({ method: "POST" }).middleware([sessionMiddleware]).handler(beginSecondFactor_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	return beginEnrolment(sql, context.userId, await emailOf(context.userId));
});
var confirmSecondFactor_createServerFn_handler = createServerRpc({
	id: "1898af4237225070350f3d9ec08fe1b4e7bfcaa2b94ffe9d87dc22153309e486",
	name: "confirmSecondFactor",
	filename: "src/lib/mfa.functions.ts"
}, (opts) => confirmSecondFactor.__executeServer(opts));
var confirmSecondFactor = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(confirmSecondFactor_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	return confirmEnrolment(sql, context.userId, context.sessionId, String(data.code ?? ""));
});
var confirmThisSession_createServerFn_handler = createServerRpc({
	id: "4874e00b5f36de72d9810e6bac559a731c9484a8b282f4210cb48651db31060c",
	name: "confirmThisSession",
	filename: "src/lib/mfa.functions.ts"
}, (opts) => confirmThisSession.__executeServer(opts));
var confirmThisSession = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(confirmThisSession_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const recovery = String(data.recovery ?? "").trim();
	if (recovery) return presentRecovery(sql, context.userId, context.sessionId, recovery);
	return presentFactor(sql, context.userId, context.sessionId, String(data.code ?? ""));
});
var replaceSecondFactor_createServerFn_handler = createServerRpc({
	id: "96f26154b84fae3be0d08d6e4d666fdece7c952d300fc0fda311273deba55bd3",
	name: "replaceSecondFactor",
	filename: "src/lib/mfa.functions.ts"
}, (opts) => replaceSecondFactor.__executeServer(opts));
var replaceSecondFactor = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(replaceSecondFactor_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	return replaceWithRecovery(sql, context.userId, context.sessionId, String(data.recovery ?? ""), await emailOf(context.userId));
});
var endOtherSessions_createServerFn_handler = createServerRpc({
	id: "bf5e5b819d0473460bc7a61e5c8e91624e9752d0fbd1485d832311c9079e2323",
	name: "endOtherSessions",
	filename: "src/lib/mfa.functions.ts"
}, (opts) => endOtherSessions.__executeServer(opts));
var endOtherSessions = createServerFn({ method: "POST" }).middleware([sessionMiddleware]).handler(endOtherSessions_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	return revokeOtherSessions(sql, context.userId, context.sessionId);
});
//#endregion
export { beginSecondFactor_createServerFn_handler, confirmSecondFactor_createServerFn_handler, confirmThisSession_createServerFn_handler, endOtherSessions_createServerFn_handler, replaceSecondFactor_createServerFn_handler, securityStatus_createServerFn_handler };
