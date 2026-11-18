import { o as getRequest } from "./ssr.mjs";
import { t as auth } from "./server-BUfuWHp1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-id.server-D8CDo34l.js
async function resolveSessionId(bearerToken) {
	const request = getRequest();
	if (!request) return null;
	let headers = request.headers;
	if (bearerToken) {
		headers = new Headers(request.headers);
		headers.set("Authorization", `Bearer ${bearerToken}`);
	}
	const id = (await auth.api.getSession({ headers }))?.session?.id;
	return typeof id === "string" && id ? id : null;
}
//#endregion
export { resolveSessionId };
